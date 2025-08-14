import { postgrePool } from "./lib/postgres.js";

const CREATE_TABLE_POWER_CONSUMPTION_QUERY = `
CREATE TABLE IF NOT EXISTS power_consumption_data (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  global_active_power REAL,
  global_reactive_power REAL,
  voltage REAL,
  global_intensity REAL,
  submetering1 REAL,
  submetering2 REAL,
  submetering3 REAL
);
`;

const CREATE_TABLE_HOURLY_POWER_CONSUMPTION_QUERY = `
CREATE TABLE IF NOT EXISTS hourly_power_consumption_data (
  id SERIAL PRIMARY KEY,
  event_count INTEGER,
  timestamp_start TIMESTAMP NOT NULL,
  timestamp_end TIMESTAMP NOT NULL,
  global_active_power_avg REAL,
  global_reactive_power_avg REAL,
  voltage_avg REAL,
  global_intensity_avg REAL,
  submetering1_avg REAL,
  submetering2_avg REAL,
  submetering3_avg REAL
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
