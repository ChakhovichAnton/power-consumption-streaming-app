import { ROOMS, EVENT_NAMES } from "./constants.js";

const validateRoom = (room) => Object.values(ROOMS).includes(room);

export const socketHandler = (socket) => {
  socket.on(EVENT_NAMES.subscribe, (message) => {
    const room = JSON.parse(message)?.room;

    if (validateRoom(room)) {
      socket.join(room);
    }
  });

  socket.on(EVENT_NAMES.unsubscribe, (message) => {
    const room = JSON.parse(message)?.room;

    if (validateRoom(room)) {
      socket.leave(room);
    }
  });
};
