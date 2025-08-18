import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import {
  getPowerConsumption,
  getDatesWithPowerConsumptionData,
  getLatestPowerConsumptionData,
} from "./controllers/powerConsumption.js";
import { socketHandler } from "./sockets/powerConsumption.js";
import { FRONTEND_ORIGIN_CORS } from "../constants.js";

const PORT = 3000;

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: FRONTEND_ORIGIN_CORS, methods: ["GET", "POST"] },
});

// Routes
app.get("/", (req, res) => res.send("Hello World!"));

app.get("/power-consumption-dates", getDatesWithPowerConsumptionData);
app.get("/power-consumption-latest", getLatestPowerConsumptionData);
app.get("/power-consumption", getPowerConsumption);

// Sockets
io.on("connection", (socket) => socketHandler(io, socket));

server.listen(PORT, () =>
  console.log(`Power consumption API listening on port ${PORT}`)
);
