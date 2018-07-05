import _ from 'lodash';
import commonNodes from "../common/nodes.js";
import moment from 'moment';
import net from 'net';
import {redisClient} from './redis.js';
import * as postgres from './postgres.js';

const NODE_ERROR = -1;
const NODE_TIMEOUT = -2;

const REDIS_KEY = 'api_nodes';

export const handler = function(req, res) {
  if (process.env.RANDOM_NODES_MEASUREMENTS) {
    return randomNodesHandler(req, res);
  }

  redisClient.get(REDIS_KEY, function(err, data) {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    data = JSON.parse(data);
    res.send(data);
  });
}

function randomNodesHandler(req, res) {
  // Find last timestamp with minutes % 5 == 0
  var date = moment().utc();
  date = date.subtract(date.minutes() % 5, 'minutes');
  const measurementsCount = 100;

  var dates = [];

  for (var i = 0; i < measurementsCount; i++) {
    dates.push(date.format("YYYY-MM-DD HH:mm"));
    date = date.subtract(5, 'minutes')
  }

  // Generate some random data
  var response = {};

  for (var node of commonNodes) {
    response[node.id] = {
      latest: []
    };
    for (var i = 0; i < measurementsCount; i++) {
      var status;
      var rand = Math.floor(Math.random() * 2);
      if (Math.floor(Math.random() * 10) < 7) {
        status = 1;
      } else {
        status = NODE_ERROR;
      }

      response[node.id].uptime_24h = Math.round(Math.random() * 10000)/100;
      response[node.id].uptime_30d = Math.round(Math.random() * 10000)/100;

      response[node.id].latest.push({
        date: dates[i],
        status: status
      });
    }
  }

  res.send(response);
}

function checkNode(node) {
  return new Promise((resolve, reject) => {
    let client = new net.Socket();
    let start = moment();
    client.setTimeout(10*1000);
    console.log("checkNode: connecting to: "+node.host)

    client.connect(node.port, node.host, function() {
      client.end();
      resolve({id: node.id, connectedIn: moment().diff(start)});
    });

    client.on('error', () => {
      client.end();
      resolve({id: node.id, connectedIn: NODE_ERROR});
    });

    client.on('timeout', () => {
      client.end();
      resolve({id: node.id, connectedIn: NODE_TIMEOUT});
    });
  });
}

function checkNodes() {
  let date = moment().seconds(0).milliseconds(0);

  // Check uptime every 5 minutes
  if (date.minutes() % 5 != 0) {
    console.log("checkNodes: not time "+date.format("YYYY-MM-DD HH:mm"))
    return;
  }

  Promise.all(_.map(commonNodes, checkNode))
    .then(results => {
      var instances = [];
      for (let result of results) {
        instances.push({
          node_id: result.id,
          date: date,
          status: result.connectedIn
        })
      }

      return postgres.NodeMeasurement.bulkCreate(instances).then(() => {
        console.log(`Added nodes uptime stats for ${date}!`);
      });
    })
    // Save results
    .then(() => {
      // We want to return the latest 100 measurements (measurements every 5 minutes so from the last 500-1 minutes).
      // We also want to return `0` value for recently added nodes or nodes with no data for a given timestamp.
      // So first we cross join dates and node names and then left join measurements for given nodes and date.
      const measurementsCount = 100;

      // Find last timestamp with minutes % 5 == 0
      var date = moment().utc();
      var latestMeasurement = date.subtract(date.minutes() % 5, 'minutes').format("YYYY-MM-DD HH:mm");
      // map: node.id => node
      var nodeData = _.mapKeys(commonNodes, node => node.id);
      var nodeNames = _(commonNodes).map(node => `('${node.id}')`).join();
      var query = "select n.node_id as node_id, d.day as date, coalesce(m.status, 0) as status "+
        "from (select generate_series(timestamp '"+latestMeasurement+"', timestamp '"+latestMeasurement+"' - interval '"+(measurementsCount*5-1)+" minute', interval '-5 minute')) d(day) "+
        "cross join (select * from (values "+nodeNames+") as node_names) as n(node_id) "+
        "left join node_measurements m ON n.node_id = m.node_id and m.date = d.day order by d.day desc;"

      var response = {};

      postgres.sequelize.query(query, {model: postgres.NodeMeasurement}).then(measurements => {
        for (let measurement of measurements) {
          let node_id = measurement.get('node_id');
          if (response[node_id] === undefined) {
            response[node_id] = {
              name: nodeData[node_id].name,
              host: nodeData[node_id].host,
              port: nodeData[node_id].port,
              publicKey: nodeData[node_id].publicKey,
              latest: []
            };
          }
          response[node_id].latest.push({
            date: measurement.get('date'),
            status: measurement.get('status'),
          });
        }
      })
      .then(() => {
        // Get uptime stats
        var query = "select "+
          "node_id, "+
          "count(*) filter (where date >= NOW() - '24 hour'::INTERVAL) as all_24h, "+
          "count(*) filter (where status > 0 and date >= NOW() - '24 hour'::INTERVAL) as up_24h, "+
          "count(*) as all_30d, "+
          "count(*) filter (where status > 0) as up_30d "+
          "from node_measurements where date >= NOW() - '30 day'::INTERVAL group by node_id;";

        // Require measurements from at least 23h to be meaningful for 24h stats.
        const requiredMeasurements24h = 23*60/5;
        // Require measurements from at least 29d to be meaningful for 30d stats.
        const requiredMeasurements30d = (24*60/5)*29;

        return postgres.sequelize.query(query, {type: postgres.sequelize.QueryTypes.SELECT}).then(stats => {
          for (let stat of stats) {
            if (stat.all_24h >= requiredMeasurements24h) {
              response[stat.node_id].uptime_24h = Math.round(stat.up_24h/stat.all_24h*10000)/100;
            }

            if (stat.all_30d >= requiredMeasurements30d) {
              response[stat.node_id].uptime_30d = Math.round(stat.up_30d/stat.all_30d*10000)/100;
            }
          }
        });
      })
      .then(() => {
        // Cache results
        redisClient.set(REDIS_KEY, JSON.stringify(response), function(err, data) {
          if (err) {
            console.error(err);
            return;
          }

          console.log("/api/nodes data saved!");
        });
      });
    });
}

setInterval(checkNodes, 60*1000);
checkNodes();
