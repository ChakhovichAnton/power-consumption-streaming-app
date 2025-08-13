import { parseIsoTimestamp } from "../lib/time.js";

export const validateStartAndEndTimestamps = (start, end) => {
  if (!start || !end) {
    return { error: "Start and end timestamps are required" };
  }

  const startTimestamp = parseIsoTimestamp(start);
  if (!startTimestamp) {
    return { error: "Invalid start timestamp" };
  }

  const endTimestamp = parseIsoTimestamp(end);
  if (!endTimestamp) {
    return { error: "Invalid end timestamp" };
  }

  return { start: startTimestamp, end: endTimestamp };
};

export const validateGranularity = (granularity) => {
  if (["hour", "minute"].includes(granularity)) {
    return true;
  }
  return { error: "Invalid granularity" };
};
