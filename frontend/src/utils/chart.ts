import type { PowerConsumptionResult } from "../types";

type DataLabel =
  | "globalActivePower"
  | "globalIntensity"
  | "voltage"
  | "submetering1"
  | "submetering2"
  | "submetering3";

type HourlyDataLabel =
  | "globalActivePowerAvg"
  | "globalIntensityAvg"
  | "voltageAvg"
  | "submetering1Avg"
  | "submetering2Avg"
  | "submetering3Avg";

interface PowerConsumptionChartAttribute {
  dataLabel: DataLabel;
  hourlyDataLabel: HourlyDataLabel;
  label: string;
  borderColor: string;
  yAxis: {
    key: string;
    text: string;
  };
}

export const POWER_CONSUMPTION_CHART_ATTRIBUTES: PowerConsumptionChartAttribute[] =
  [
    {
      dataLabel: "globalActivePower",
      hourlyDataLabel: "globalActivePowerAvg",
      label: "Global Active Power",
      borderColor: "blue",
      yAxis: {
        key: "yGlobalActivePower",
        text: "Global Active Power (kW)",
      },
    },
    {
      dataLabel: "globalIntensity",
      hourlyDataLabel: "globalIntensityAvg",
      label: "Global Intensity",
      borderColor: "red",
      yAxis: {
        key: "yGlobalIntensity",
        text: "Global Intensity (kW)",
      },
    },
    {
      dataLabel: "voltage",
      hourlyDataLabel: "voltageAvg",
      label: "Voltage",
      borderColor: "green",
      yAxis: {
        key: "yVoltage",
        text: "Voltage (V)",
      },
    },
    {
      dataLabel: "submetering1",
      hourlyDataLabel: "submetering1Avg",
      label: "Submetering 1",
      borderColor: "purple",
      yAxis: {
        key: "ySubmetering1",
        text: "Submetering 1 (Wh)",
      },
    },
    {
      dataLabel: "submetering2",
      hourlyDataLabel: "submetering2Avg",
      label: "Submetering 2",
      borderColor: "yellow",
      yAxis: {
        key: "ySubmetering2",
        text: "Submetering 2 (Wh)",
      },
    },
    {
      dataLabel: "submetering3",
      hourlyDataLabel: "submetering3Avg",
      label: "Submetering 3",
      borderColor: "pink",
      yAxis: {
        key: "ySubmetering3",
        text: "Submetering 3 (Wh)",
      },
    },
  ];

export const powerConsumptionDataToChartDataset = ({
  granularity,
  data,
}: PowerConsumptionResult) => {
  return POWER_CONSUMPTION_CHART_ATTRIBUTES.map((val) => {
    const dataCoords =
      granularity === "hour"
        ? data.map((d) => {
            return {
              x: new Date(d.timestampStart).getTime(),
              y: d[val.hourlyDataLabel],
            };
          })
        : data.map((d) => {
            return { x: new Date(d.timestamp).getTime(), y: d[val.dataLabel] };
          });

    return {
      label: val.label,
      data: dataCoords,
      borderColor: val.borderColor,
      fill: true,
      yAxisID: val.yAxis.key,
    };
  });
};
