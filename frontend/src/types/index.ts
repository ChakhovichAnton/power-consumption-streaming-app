export interface PowerConsumptionData {
  id: number;
  timestamp: string;
  globalActivePower: number;
  globalReactivePower: number;
  globalIntensity: number;
  voltage: number;
  submetering1: number;
  submetering2: number;
  submetering3: number;
}

export interface HourlyPowerConsumptionData {
  id: number;
  eventCount: number;
  timestampStart: string;
  timestampEnd: string;
  globalActivePowerAvg: number;
  globalReactivePowerAvg: number;
  globalIntensityAvg: number;
  voltageAvg: number;
  submetering1Avg: number;
  submetering2Avg: number;
  submetering3Avg: number;
}

export type PowerConsumptionDataGranularity = "hour" | "minute";

export type PowerConsumptionResult = (
  | {
      data: HourlyPowerConsumptionData[];
      granularity: "hour";
    }
  | {
      data: PowerConsumptionData[];
      granularity: "minute";
    }
) & { count: number };
