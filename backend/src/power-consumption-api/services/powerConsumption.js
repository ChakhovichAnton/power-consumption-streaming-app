import { postgrePool } from "../../lib/postgres.js";

export const getDatesWithData = async (startISOString, endISOString) => {
  const query = `
  SELECT DISTINCT DATE(timestamp) AS date_with_data
  FROM power_consumption_data
  WHERE timestamp >= $1 AND timestamp <  $2
  ORDER BY date_with_data;`;

  return await postgrePool.query(query, [startISOString, endISOString]);
};

export const getConsumption = async (
  startISOString,
  endISOString,
  limit,
  offset
) => {
  const query = `
  SELECT *
  FROM power_consumption_data
  WHERE timestamp >= $1 AND timestamp <= $2
  ORDER BY timestamp
  LIMIT $3 OFFSET $4;`;

  return await postgrePool.query(query, [
    startISOString,
    endISOString,
    limit,
    offset,
  ]);
};

export const getLatestConsumption = async () => {
  const query = `
  SELECT *
  FROM power_consumption_data
  WHERE
    timestamp >= (
      SELECT MAX(timestamp) - INTERVAL '24 hours'
      FROM power_consumption_data
    ) AND
    timestamp <= (
      SELECT MAX(timestamp)
      FROM power_consumption_data
    )
  ORDER BY timestamp;`;

  return await postgrePool.query(query);
};
