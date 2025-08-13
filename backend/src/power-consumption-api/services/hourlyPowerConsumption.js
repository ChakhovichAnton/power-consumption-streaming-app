import { postgrePool } from "../../lib/postgres.js";

export const getHourlyConsumption = async (startISOString, endISOString, limit, offset) => {
  const query = `
  SELECT *
  FROM hourly_power_consumption_data
  WHERE timestampStart >= $1 AND timestampEnd <= $2
  ORDER BY timestampStart
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
    timestampStart >= (
      SELECT MAX(timestampEnd) - INTERVAL '24 hours'
      FROM hourly_power_consumption_data
    ) AND
    timestampEnd <= (
      SELECT MAX(timestampEnd)
      FROM hourly_power_consumption_data
    )
  ORDER BY timestampStart;`;

  return await postgrePool.query(query);
};
