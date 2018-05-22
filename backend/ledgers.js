import stellarSdk from 'stellar-sdk';
import moment from 'moment';
import {redisClient} from './redis.js';

export const handler = function(req, res) {
  var day = moment();
  var response = [];

  var multi = redisClient.multi();

  var days = 30;

  for (var i = 0; i < days; i++) {
    response.push({date: day.format("DD-MM")});
    multi.hmget('ledger_public'+day.format("YYYY-MM-DD"), 'transaction_count', 'operation_count');
    day = day.subtract(1, 'days')
  }

  multi.exec(function (err, redisRes) {
    if (err) {
      res.sendStatus(500);
      console.error(err);
      res.error("Error");
      return;
    }

    for (var i = 0; i < days; i++) {
      response[i].transaction_count = parseInt(redisRes[i][0]);
      response[i].operation_count = parseInt(redisRes[i][1]);
    }

    res.send(response);
  });
}

// Stream ledgers - get last paging_token
redisClient.get('paging_token', function(err, pagingToken) {
  if (err) {
    console.error(err);
    return
  }

  if (!pagingToken) {
    pagingToken = 'now';
  }

  var horizon = new stellarSdk.Server('https://horizon.stellar.org');
  horizon.ledgers().cursor(pagingToken).stream({
    onmessage: function(ledger) {
      var date = moment(ledger.closed_at).format("YYYY-MM-DD");
      var key = "ledger_public"+date;

      var multi = redisClient.multi();
      multi.hincrby(key, "transaction_count", ledger.transaction_count);
      multi.hincrby(key, "operation_count", ledger.operation_count);
      // Expire the key after 32 days
      multi.expire(key, 60*60*24*32);
      multi.set("paging_token", ledger.paging_token);
      multi.exec(function (err, res) {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Added Ledger:"+ledger.sequence+" "+ledger.closed_at+" "+res);
      });
    }
  });
});
