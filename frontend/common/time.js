import moment from "moment";

export function ago(a) {
  let diff = moment().diff(a, "seconds");
  if (diff < 60) {
    return `${diff}s`;
  } else if (diff < 60 * 60) {
    diff = moment().diff(a, "minutes");
    return `${diff}m`;
  } else if (diff < 24 * 60 * 60) {
    diff = moment().diff(a, "hours");
    return `${diff}h`;
  } else {
    diff = moment().diff(a, "days");
    return `${diff}d`;
  }
}
