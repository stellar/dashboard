import stellarSdk from "stellar-sdk";
import { map, pick } from "lodash";
import { QueryTypes } from "sequelize";
import { Response } from "express";
import * as postgres from "./postgres";

interface Ledger {
  date: string;
  transaction_count: number;
  operation_count: number;
}

interface LedgerSql {
  date: string;
  transaction_count: string;
  operation_count: string;
}

let cachedData: Array<Ledger>;

export const handler = function (_: any, res: Response) {
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
    .query(query, { type: QueryTypes.SELECT })
    .then((results: Array<LedgerSql>) => {
      cachedData = map(results, convertFields);
    });
}

function convertFields(ledger: LedgerSql): Ledger {
  return {
    // Remove year from date
    date: ledger["date"].substring(5),
    transaction_count: parseInt(ledger.transaction_count),
    operation_count: parseInt(ledger.operation_count),
  };
}

// Wait for schema sync
postgres.sequelize.addHook("afterBulkSync", () => {
  setInterval(updateResults, 60 * 1000);
  updateResults();

  if (process.env.UPDATE_DATA == "true") {
    // Stream ledgers - get last paging_token/
    postgres.LedgerStats.findOne({ order: [["sequence", "DESC"]] }).then(
      (lastLedger: postgres.LedgerStats) => {
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
            // TODO - use type any until https://github.com/stellar/js-stellar-sdk/issues/731 resolved
            onmessage: (ledger: any) => {
              let newLedger: any = pick(ledger, [
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
