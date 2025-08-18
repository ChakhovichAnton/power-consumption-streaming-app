import { useEffect } from "react";
import type { PowerConsumptionData } from "../types";
import { EVENT_NAMES, ROOMS, socket } from "../socket";

const useSocketIOForPowerConsumptionData = (
  isLive: boolean,
  addLatestDatapoint: (data: PowerConsumptionData) => Promise<void>
) => {
  useEffect(() => {
    const onMessage = (message: string) => {
      if (isLive) {
        addLatestDatapoint(JSON.parse(message) as PowerConsumptionData);
      }
    };

    socket.on(EVENT_NAMES.newMinuteData, onMessage);

    return () => {
      socket.off(EVENT_NAMES.newMinuteData, onMessage);
    };
  }, [addLatestDatapoint, isLive]);

  const subscribe = () => {
    socket.emit(
      EVENT_NAMES.subscribe,
      JSON.stringify({ room: ROOMS.POWER_CONSUMPTION_DATA_MINUTE })
    );
  };

  const unsubscribe = () => {
    socket.emit(
      EVENT_NAMES.unsubscribe,
      JSON.stringify({ room: ROOMS.POWER_CONSUMPTION_DATA_MINUTE })
    );
  };

  return { subscribe, unsubscribe };
};

export default useSocketIOForPowerConsumptionData;
