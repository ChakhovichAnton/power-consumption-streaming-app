import { postgrePool } from "../../lib/postgres.js";

export const getDatesWithHourlyData = async (startISOString, endISOString) => {
  const query = `
  SELECT DISTINCT DATE(timestamp_start) AS date_with_data
  FROM hourly_power_consumption_data
  WHERE timestamp_start >= $1 AND timestamp_end < $2
  ORDER BY date_with_data;`;

  return await postgrePool.query(query, [startISOString, endISOString]);
};

export const getHourlyConsumption = async (startISOString, endISOString, limit, offset) => {
  const query = `
  SELECT *
  FROM hourly_power_consumption_data
  WHERE timestamp_start >= $1 AND timestamp_end <= $2
  ORDER BY timestamp_start
  LIMIT $3 OFFSET $4;`;

  return await postgrePool.query(query, [
    startISOString,
    endISOString,
    limit,
    offset,
  ]);
};

export const getLatestHourlyConsumption = async () => {
  const query = `
  SELECT *
  FROM hourly_power_consumption_data
  WHERE
    timestamp_start >= (
      SELECT MAX(timestamp_end) - INTERVAL '24 hours'
      FROM hourly_power_consumption_data
    ) AND
    timestamp_end <= (
      SELECT MAX(timestamp_end)
      FROM hourly_power_consumption_data
    )
  ORDER BY timestamp_start;`;

  return await postgrePool.query(query);
};
