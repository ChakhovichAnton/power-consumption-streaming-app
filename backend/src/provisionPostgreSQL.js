import { postgrePool } from "./lib/postgres.js";

const CREATE_TABLE_QUERY = `
CREATE TABLE IF NOT EXISTS power_consumption_data (
  id SERIAL PRIMARY KEY,
  timestamp BIGINT,
  globalActivePower REAL,
  globalReactivePower REAL,
  voltage REAL,
  globalIntensity REAL,
  subMetering1 REAL,
  subMetering2 REAL,
  subMetering3 REAL
);
`;

export const main = async () => {
  console.log("Provisioning PostgreSQL");

  const client = await postgrePool.connect();

  try {
    await client.query(CREATE_TABLE_QUERY);

    console.log("Provisioning completed successfully");
  } catch (e) {
    console.log("Provisioning failed: ", e);
  } finally {
    client.release();
  }

  await postgrePool.end();
};

main();
