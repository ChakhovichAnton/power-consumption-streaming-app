import type { PowerConsumptionResult } from "../types";

const POWER_CONSUMPTION_DATA_ATTRIBUTES = [
  "globalActivePower" as const,
  "globalIntensity" as const,
  "voltage" as const,
  "submetering1" as const,
  "submetering2" as const,
  "submetering3" as const,
];

const HOURLY_POWER_CONSUMPTION_DATA_ATTRIBUTES = [
  "globalActivePowerAvg" as const,
  "globalIntensityAvg" as const,
  "voltageAvg" as const,
  "submetering1Avg" as const,
  "submetering2Avg" as const,
  "submetering3Avg" as const,
];

export const powerConsumptionDataToChartDataset = ({
  granularity,
  data,
}: PowerConsumptionResult) => {
  if (granularity === "hour") {
    return HOURLY_POWER_CONSUMPTION_DATA_ATTRIBUTES.map((val) => {
      return {
        label: val,
        data: data.map((d) => {
          return { x: new Date(d.timestampStart).getTime(), y: d[val] };
        }),
        borderColor: "blue",
        fill: true,
      };
    });
  }
  return POWER_CONSUMPTION_DATA_ATTRIBUTES.map((val) => {
    return {
      label: val,
      data: data.map((d) => {
        return { x: new Date(d.timestamp).getTime(), y: d[val] };
      }),
      borderColor: "blue",
      fill: true,
    };
  });
};
