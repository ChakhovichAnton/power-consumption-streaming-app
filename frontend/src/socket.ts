import { io } from "socket.io-client";
import { BACKEND_URL } from "./constants";

export const socket = io(BACKEND_URL);

export const ROOMS = {
  POWER_CONSUMPTION_DATA_MINUTE: "power-consumption-data-minute-room",
};

export const EVENT_NAMES = {
  subscribe: "subscribe",
  unsubscribe: "unsubscribe",
  newMinuteData: "new-minute-data",
};
