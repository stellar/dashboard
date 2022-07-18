import { bigQueryEndpointBase, fetchCachedData } from "../utils";

export async function getFeesData30d() {
  const query = `
    SELECT 
      cast(l.closed_at as date) as closing_date, 
      (
        sum(t.fee_charged) / sum(t.operation_count)
      ) as fee_average
    FROM ${bigQueryEndpointBase}.history_transactions t
    JOIN ${bigQueryEndpointBase}.history_ledgers l
    ON t.ledger_sequence = l.sequence
    WHERE l.closed_at >= timestamp(date_add(current_date(), INTERVAL -30 DAY))
    GROUP BY closing_date
    ORDER BY closing_date
  `;

  const data = await fetchCachedData("fees-month", query);
  const output = data.map((fee) => {
    return {
      ...fee,
      closing_date: fee.closing_date.value,
    };
  });

  return output;
}

export async function getFeesData1d() {
  const query = `
    SELECT 
      l.closed_at - (EXTRACT(MINUTE FROM l.closed_at) * INTERVAL '01' MINUTE)
      - (EXTRACT(SECOND FROM l.closed_at) * INTERVAL '01' SECOND) as closing_hour,
      (sum(t.fee_charged) / sum(t.operation_count)) as fee_average
    FROM ${bigQueryEndpointBase}.history_transactions t
    JOIN ${bigQueryEndpointBase}.history_ledgers l
    ON t.ledger_sequence = l.sequence
    WHERE l.closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR) 
    GROUP BY closing_hour
    ORDER BY closing_hour
  `;
  const data = await fetchCachedData("fees-day", query);

  const output = data.map((fee) => {
    return {
      ...fee,
      closing_hour: fee.closing_hour.value,
    };
  });
  return output;
}
