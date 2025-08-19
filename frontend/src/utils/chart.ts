import type { ChartDataset, Point } from "chart.js";
import type { PowerConsumptionData, PowerConsumptionResult } from "../types";

type DataLabel =
  | "globalActivePower"
  | "globalReactivePower"
  | "globalIntensity"
  | "voltage"
  | "submetering1"
  | "submetering2"
  | "submetering3";

type HourlyDataLabel =
  | "globalActivePowerAvg"
  | "globalReactivePowerAvg"
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

export const MAX_VISIBLE_DATAPOINT_COUNT = 300;

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
      dataLabel: "globalReactivePower",
      hourlyDataLabel: "globalReactivePowerAvg",
      label: "Global Reactive Power",
      borderColor: "gray",
      yAxis: {
        key: "yGlobalReactivePower",
        text: "Global Reactive Power (kW)",
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

/**
 * Offset to leave pannable data onto both sides. Subtract 2 from
 * MAX_VISIBLE_DATAPOINT_COUNT to make it pannable on both sides
 * if there are exactly MAX_VISIBLE_DATAPOINT_COUNT many datapoints */
const getDatasetOffset = (dataset: ChartDataset<"line">) => {
  return (dataset.data.length - (MAX_VISIBLE_DATAPOINT_COUNT - 2)) / 2;
};

export const datasetToVisibleDataset = (dataset: ChartDataset<"line">) => {
  if (dataset.data.length <= MAX_VISIBLE_DATAPOINT_COUNT) {
    return dataset; // Show all of the data
  }

  const offset = getDatasetOffset(dataset);
  const data = dataset.data.slice(offset, MAX_VISIBLE_DATAPOINT_COUNT + offset);
  return { ...dataset, data };
};

export const datasetsMinX = (datasets: ChartDataset<"line">[]) => {
  return datasets
    .filter((d) => d.data.length > 0)
    .map((d) => (d.data[0] as Point).x)
    .reduce((prev, cur) => (prev < cur ? prev : cur));
};

export const datasetsMaxX = (datasets: ChartDataset<"line">[]) => {
  return datasets
    .filter((d) => d.data.length > 0)
    .map((d) => (d.data[d.data.length - 1] as Point).x)
    .reduce((prev, cur) => (prev > cur ? prev : cur));
};

/**
 * Filters data which is MAX_VISIBLE_DATAPOINT_COUNT datapoints away from
 * the visible visibleMinX or the visibleMaxX
 */
export const filterFarAwayData = (
  data: Point[],
  visibleMinX: number,
  visibleMaxX: number
) => {
  const minIndex = data.findIndex(({ x }) => x >= visibleMinX);
  const maxIndex = data.findIndex(({ x }) => x > visibleMaxX);
  return data.filter(
    (_, index) =>
      index >= minIndex - MAX_VISIBLE_DATAPOINT_COUNT &&
      index <= maxIndex + MAX_VISIBLE_DATAPOINT_COUNT
  );
};

export const addDatapointToDataset = (
  datasets: ChartDataset<"line">[],
  shiftingCondition: (length: number) => boolean,
  data: PowerConsumptionData
) => {
  return datasets.map((ds, index) => {
    // Remove first element if there are many stored to improve performance
    if (shiftingCondition(ds.data.length)) ds.data.shift();

    // Add new datapoint to dataset
    const x = new Date(data.timestamp).getTime();
    const y = data[POWER_CONSUMPTION_CHART_ATTRIBUTES[index].dataLabel];
    ds.data.push({ x, y });

    return ds;
  });
};
