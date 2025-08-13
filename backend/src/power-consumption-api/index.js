import express from "express";
import { createServer } from "http";
import cors from "cors";
import {
  getPowerConsumption,
  getDatesWithPowerConsumptionData,
  getLatestPowerConsumptionData,
} from "./controllers/powerConsumption.js";

const PORT = 3000;

const app = express();
app.use(cors());

const server = createServer(app);

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/power-consumption-dates", getDatesWithPowerConsumptionData);
app.get("/power-consumption-latest", getLatestPowerConsumptionData);
app.get("/power-consumption", getPowerConsumption);

server.listen(PORT, () =>
  console.log(`Power consumption API listening on port ${PORT}`)
);
