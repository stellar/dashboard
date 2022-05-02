import { Horizon } from "stellar-sdk";

interface ErrorTextObject {
  [key: string]: string;
}

export const TX_ERROR_TEXT: ErrorTextObject = {
  buy_not_authorized:
    "The issuer must authorize you to trade this token. Visit the issuer’s site more info.",
  op_malformed: "The input is incorrect and would result in an invalid offer.",
  op_sell_no_trust: "You are not authorized to sell this asset.",
  op_line_full: "You have reached the limit allowed for buying that asset.",
  op_underfunded: "You don’t have enough to cover that transaction.",
  op_under_dest_min:
    "We couldn’t complete your transaction at this time because the exchange rate offered is no longer available. Please try again.",
  op_over_source_max:
    "We couldn’t complete your transaction at this time because the exchange rate offered is no longer available. Please try again.",
  op_cross_self:
    "You already have an offer out that would immediately cross this one.",
  op_sell_no_issuer: "The issuer of that token doesn’t exist.",
  buy_no_issuer: "The issuer of that token doesn’t exist.",
  op_offer_not_found: "We couldn’t find that offer.",
  op_low_reserve: "That offer would take you below the minimum XLM reserve.",
  tx_bad_auth: "Something went wrong while signing a transaction.",
  tx_bad_seq:
    "The app has gotten out of sync with the network. Please try again later.",
};

/**
 * Given a Horizon error object, return a human-readable string that summarizes
 * it.
 *
 * @param {Error} err - error object from horizon
 * @returns {string} error string
 */
export function getErrorString(err: any): string {
  const e = err && err.response ? err.response : err;

  // timeout errors return timeout
  if (e && e.status === 504) {
    return "Sorry, the request timed out! Please try again later.";
  }

  // first, try to parse the errors in extras
  if (e && e.data && e.data.extras && e.data.extras.result_codes) {
    const resultCodes = e.data.extras.result_codes;

    if (resultCodes.operations) {
      // Map all errors into a single message string.
      const codes = resultCodes.operations;
      // Transactions with multiple operations might have mixed successes and
      // errors. Ignore some codes to only handle codes we have messages for.
      const ignoredCodes = ["op_success"];
      const message = codes
        .filter((code: string) => !ignoredCodes.includes(code))
        .map((code: string) => TX_ERROR_TEXT[code] || `Error code '${code}'`)
        .join(", ");

      if (message) {
        return message;
      }
    }

    if (resultCodes.transaction) {
      return (
        TX_ERROR_TEXT[resultCodes.transaction] ||
        `Error code '${resultCodes.transaction}'`
      );
    }
  }

  if (e && e.data && e.data.detail) {
    return e.data.detail;
  }

  if (e && e.detail) {
    return e.detail;
  }

  if (e && e.message) {
    return e.message;
  }

  if (e && e.errors) {
    return e.errors[0].message;
  }

  if (e && e.error) {
    return e.error;
  }

  return e.toString();
}

/**
 * Given a Horizon error object, return the error code
 *
 * @param {Error} err - error object from horizon
 * @returns {string} error code
 */
export function getErrorCodeString(err: any): string {
  const errors = getErrorCodes(err);
  return errors.map((e) => `[Error code: '${e}']`).join(`, `);
}

/**
 * Given a Horizon error object, return a list of the error codes.
 *
 * @param {Error} err - error object from horizon
 * @returns {string[]} error code
 */
export function getErrorCodes(err: any): string[] {
  const e = err && err.response ? err.response : err;

  let errors: string[] = [];

  // timeout errors return timeout
  if (e && e.status === 504) {
    return ["request_timeout"];
  }

  // first, try to parse the errors in extras
  // eslint-disable-next-line camelcase
  if (e?.data?.extras?.result_codes) {
    const { result_codes: resultCodes }: Horizon.TransactionFailedExtras =
      e.data.extras;

    if (resultCodes.operations) {
      const codes = resultCodes.operations;
      // Transactions with multiple operations might have mixed successes and
      // errors. Ignore the success codes and add only the errors.
      const ignoredCodes = ["op_success"];
      errors = [
        ...errors,
        ...codes.filter((code: string) => !ignoredCodes.includes(code)),
      ];
    }

    if (errors.length) {
      return errors;
    }

    if (resultCodes.transaction) {
      return [resultCodes.transaction];
    }
  }

  if (e?.data?.detail) {
    return [e.data.detail];
  }

  if (e?.detail) {
    return [e.detail];
  }

  if (e?.message) {
    return [e.message];
  }

  if (e?.errors) {
    return e.errors.map((messageError: any) => messageError.message);
  }

  if (e?.error) {
    return [e.error];
  }

  return [];
}
