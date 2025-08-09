import { postgrePool } from "./lib/postgres.js";

const CREATE_TABLE_POWER_CONSUMPTION_QUERY = `
CREATE TABLE IF NOT EXISTS power_consumption_data (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  globalActivePower REAL,
  globalReactivePower REAL,
  voltage REAL,
  globalIntensity REAL,
  subMetering1 REAL,
  subMetering2 REAL,
  subMetering3 REAL
);
`;

const CREATE_TABLE_HOURLY_POWER_CONSUMPTION_QUERY = `
CREATE TABLE IF NOT EXISTS hourly_power_consumption_data (
  id SERIAL PRIMARY KEY,
  eventCount INTEGER,
  timestampStart TIMESTAMP NOT NULL,
  timestampEnd TIMESTAMP NOT NULL,
  globalActivePowerAverage REAL,
  globalReactivePowerAverage REAL,
  voltageAverage REAL,
  globalIntensityAverage REAL,
  subMetering1Average REAL,
  subMetering2Average REAL,
  subMetering3Average REAL
);
`;

export const main = async () => {
  console.log("Provisioning PostgreSQL");

  const client = await postgrePool.connect();

  try {
    await client.query(CREATE_TABLE_POWER_CONSUMPTION_QUERY);
    await client.query(CREATE_TABLE_HOURLY_POWER_CONSUMPTION_QUERY);

    console.log("Provisioning completed successfully");
  } catch (e) {
    console.log("Provisioning failed: ", e);
  } finally {
    client.release();
  }

  await postgrePool.end();
};

main();
