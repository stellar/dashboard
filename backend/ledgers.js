import stellarSdk from 'stellar-sdk';
import moment from 'moment';
import _ from 'lodash';
import * as postgres from './postgres.js';

let cachedData;

export const handler = function(req, res) {
  res.send(cachedData);
}

function updateResults() {
  let query =
    `select
      to_char(closed_at, 'DD-MM') as date,
      sum(transaction_count) as transaction_count,
      sum(operation_count) as operation_count
    from ledger_stats
    where closed_at >= current_date - interval '30' day
    group by to_char(closed_at, 'DD-MM')
    order by 1 desc`;

  postgres.sequelize.query(query, {type: postgres.sequelize.QueryTypes.SELECT})
    .then(results => cachedData = results);
}

// Wait for schema sync
postgres.sequelize.addHook('afterBulkSync', () => {
  setInterval(updateResults, 60*1000);
  updateResults();

  // Stream ledgers - get last paging_token/
  postgres.LedgerStats.findOne({order: [['sequence', 'DESC']]}).then(lastLedger => {
    let pagingToken;
    if (!lastLedger) {
      pagingToken = 'now';
    } else {
      pagingToken = lastLedger.paging_token;
    }

    var horizon = new stellarSdk.Server('https://horizon.stellar.org');
    horizon.ledgers().cursor(pagingToken).stream({
      onmessage: ledger => {
        postgres.LedgerStats.create(_.pick(ledger, ['sequence', 'closed_at', 'paging_token', 'transaction_count', 'operation_count']))
          .then(() => {
            console.log("Added Ledger:"+ledger.sequence+" "+ledger.closed_at);
          });
      }
    });
  });
});
