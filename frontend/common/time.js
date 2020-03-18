import moment from "moment";

let _offset = 0;

//set offset between a (presumably) accurate time and local time
export function setTimeOffset(offset) {
  _offset = offset;
}

// calculate the time delta between now and ts in seconds
export function agoSeconds(ts) {
  return moment().diff(ts, "seconds") - _offset;
}

// calculate and format the human-readable time delta between now and ts
export function ago(a) {
  let diff = moment().diff(a, "seconds") - _offset;
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
