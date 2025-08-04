import express from "express";
import * as http from "http";
import { postgrePool } from "./../lib/postgres.js";

const PORT = 3000;

const app = express();

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/power-consumption", async (req, res) => {
  const data = await postgrePool.query(
    "SELECT * FROM power_consumption_data LIMIT 5;"
  );
  res.send(data.rows);
});

server.listen(PORT, () =>
  console.log(`Power consumption API listening on port ${PORT}`)
);
