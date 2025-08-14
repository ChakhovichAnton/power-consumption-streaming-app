import { BACKEND_URL } from "../constants";
import type {
  PowerConsumptionDataGranularity,
  PowerConsumptionResult,
} from "../types";

interface AvailableDatesResult {
  count: number;
  data: string[];
}

export const getPowerConsumptionData = async (
  startDate: Date,
  endDate: Date,
  granularity: PowerConsumptionDataGranularity
) => {
  const res = await fetch(
    `${BACKEND_URL}/power-consumption?start=${startDate.toISOString()}&end=${endDate.toISOString()}&granularity=${granularity}`
  );
  const data = await res.json();
  return { ...data, granularity } as PowerConsumptionResult;
};

export const getLatestPowerConsumptionData = async (
  granularity: PowerConsumptionDataGranularity
) => {
  const res = await fetch(
    `${BACKEND_URL}/power-consumption-latest?granularity=${granularity}`
  );
  const data = await res.json();
  return { ...data, granularity } as PowerConsumptionResult;
};

export const getAvailableDates = async (startDate: Date, endDate: Date) => {
  const res = await fetch(
    `${BACKEND_URL}/power-consumption-dates?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
  );
  const { data }: AvailableDatesResult = await res.json();
  return data.map((dateString) => new Date(dateString));
};
