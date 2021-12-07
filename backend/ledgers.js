import stellarSdk from "stellar-sdk";
import moment from "moment";
import _ from "lodash";
import * as postgres from "./postgres.js";

let cachedData;

export const handler = function(req, res) {
  res.send(cachedData);
};

function updateResults() {
  let query = `select
      to_char(closed_at, 'YYYY-MM-DD') as date,
      sum(transaction_count) as transaction_count,
      sum(operation_count) as operation_count
    from ledger_stats
    where closed_at >= current_date - interval '29' day
    group by to_char(closed_at, 'YYYY-MM-DD')
    order by 1 desc`;

  postgres.sequelize
    .query(query, { type: postgres.sequelize.QueryTypes.SELECT })
    .then((results) => (cachedData = _.each(results, convertFields)));
}

function convertFields(ledger) {
  // String to int fields
  const fields = ["transaction_count", "operation_count"];
  for (let field of fields) {
    ledger[field] = parseInt(ledger[field]);
  }

  // Remove year from date
  ledger["date"] = ledger["date"].substring(5);
  return ledger;
}

// Wait for schema sync
postgres.sequelize.addHook("afterBulkSync", () => {
  setInterval(updateResults, 60 * 1000);
  updateResults();

  if (process.env.UPDATE_DATA == "true") {
    // Stream ledgers - get last paging_token/
    postgres.LedgerStats.findOne({ order: [["sequence", "DESC"]] }).then(
      (lastLedger) => {
        let pagingToken;
        if (!lastLedger) {
          pagingToken = "now";
        } else {
          pagingToken = lastLedger.paging_token;
        }

        var horizon = new stellarSdk.Server("https://horizon.stellar.org");
        horizon
          .ledgers()
          .cursor(pagingToken)
          .limit(200)
          .stream({
            onmessage: (ledger) => {
              let newLedger = _.pick(ledger, [
                "sequence",
                "closed_at",
                "paging_token",
                "operation_count",
              ]);
              newLedger["transaction_count"] =
                ledger.successful_transaction_count +
                ledger.failed_transaction_count;
              postgres.LedgerStats.create(newLedger).then(() => {
                console.log(
                  "Added Ledger:" + ledger.sequence + " " + ledger.closed_at,
                );
              });
            },
          });
      },
    );
  }
});
