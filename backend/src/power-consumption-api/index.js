import express from "express";
import * as http from "http";
import { postgrePool } from "./../lib/postgres.js";
import cors from "cors";
import { parseIsoTimestamp } from "./../lib/time.js";

const PORT = 3000;

const app = express();
app.use(cors());

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/power-consumption", async (req, res) => {
  const {
    start,
    end,
    granularity = "hour",
    limit = 500,
    offset = 0,
  } = req.query;

  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "Start and end timestamps are required" });
  }

  if (!["hour", "minute"].includes(granularity)) {
    return res.status(400).json({ error: "Invalid granularity" });
  }

  const startTimestamp = parseIsoTimestamp(start);
  if (!startTimestamp) {
    return res.status(400).json({ error: "Invalid start timestamp" });
  }

  const endTimestamp = parseIsoTimestamp(end);
  if (!endTimestamp) {
    return res.status(400).json({ error: "Invalid end timestamp" });
  }

  const query =
    granularity === "hour"
      ? `
        SELECT *
        FROM hourly_power_consumption_data
        WHERE timestampStart >= $1 AND timestampEnd <= $2
        ORDER BY timestampStart
        LIMIT $3 OFFSET $4;`
      : `
        SELECT *
        FROM power_consumption_data
        WHERE timestamp >= $1 AND timestamp <= $2
        ORDER BY timestamp
        LIMIT $3 OFFSET $4;`;

  const result = await postgrePool.query(query, [
    startTimestamp.toISOString(),
    endTimestamp.toISOString(),
    parseInt(limit),
    parseInt(offset),
  ]);

  res.json({ count: result.rows.length, data: result.rows });
});

server.listen(PORT, () =>
  console.log(`Power consumption API listening on port ${PORT}`)
);
