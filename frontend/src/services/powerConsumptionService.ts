import { BACKEND_URL } from "../constants";
import type {
  PowerConsumptionDataGranularity,
  PowerConsumptionResult,
} from "../types";
import { getUtcMidnight } from "../utils/date";

interface AvailableDatesResult {
  count: number;
  data: string[];
}

export const getPowerConsumptionData = async (
  startDate: Date,
  endDate: Date,
  granularity: PowerConsumptionDataGranularity
) => {
  const start = getUtcMidnight(startDate).toISOString();
  const end = getUtcMidnight(endDate).toISOString();

  try {
    const res = await fetch(
      `${BACKEND_URL}/power-consumption?start=${start}&end=${end}&granularity=${granularity}`
    );
    const data = await res.json();
    return { ...data, granularity } as PowerConsumptionResult;
  } catch (error) {
    console.error(error);
  }
};

export const getLatestPowerConsumptionData = async (
  granularity: PowerConsumptionDataGranularity
) => {
  try {
    const res = await fetch(
      `${BACKEND_URL}/power-consumption-latest?granularity=${granularity}`
    );
    const data = await res.json();
    return { ...data, granularity } as PowerConsumptionResult;
  } catch (error) {
    console.error(error);
  }
};

export const getAvailableDates = async (startDate: Date, endDate: Date) => {
  try {
    const start = getUtcMidnight(startDate).toISOString();
    const end = getUtcMidnight(endDate).toISOString();

    const res = await fetch(
      `${BACKEND_URL}/power-consumption-dates?start=${start}&end=${end}`
    );
    const { data }: AvailableDatesResult = await res.json();
    return data.map((dateString) => new Date(dateString));
  } catch (error) {
    console.error(error);
    return [];
  }
};
