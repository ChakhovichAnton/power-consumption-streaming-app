import type { ChartDataset, Point } from "chart.js";
import {
  getLatestPowerConsumptionData,
  getPowerConsumptionData,
} from "../services/powerConsumptionService";
import {
  datasetsMaxX,
  datasetsMinX,
  datasetToVisibleDataset,
  filterFarAwayData,
  MAX_VISIBLE_DATAPOINT_COUNT,
  powerConsumptionDataToChartData,
  powerConsumptionDataToChartDataset,
} from "../utils/chart";
import { newDateWithADayAdded } from "../utils/date";
import type {
  PowerConsumptionData,
  PowerConsumptionDataGranularity,
  PowerConsumptionResult,
} from "../types";
import { useEffect, useState } from "react";

const usePowerConsumptionData = (
  granularity: PowerConsumptionDataGranularity
) => {
  const [datasets, setDatasets] = useState<ChartDataset<"line">[]>([]);
  const [visibleDatasets, setVisibleDatasets] = useState<
    ChartDataset<"line">[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [defaultDate, setDefaultDate] = useState(new Date());

  useEffect(() => {
    const fetchInitialData = async () => {
      if (isLoading || !isInitialFetch) return;

      setIsLoading(true);
      const newData = await getLatestPowerConsumptionData(granularity);

      // Set default timestamp to open the date picker at the correct location
      if (newData && newData.count > 0) {
        if (newData.granularity === "hour") {
          const last = newData.data[newData.count - 1];
          setDefaultDate(new Date(last.timestampStart));
        } else {
          const last = newData.data[newData.count - 1];
          setDefaultDate(new Date(last.timestamp));
        }
      }

      setIsInitialFetch(false);
      if (newData) {
        const newDatasets = powerConsumptionDataToChartDataset(newData);
        setDatasets(newDatasets);
        setVisibleDatasets(newDatasets.map(datasetToVisibleDataset));
      }
      setIsLoading(false);
    };

    fetchInitialData();
  }, [granularity, isLoading, isInitialFetch]);

  const fetchAdditionalData = async (
    when: "before" | "after", // Fetch data from before or after the current data
    visibleMinX: number,
    visibleMaxX: number
  ) => {
    if (isLoading) return;
    setIsLoading(true);

    // Fetch new data
    let newData: PowerConsumptionResult | undefined;
    const dateOffset = 60 * 60 * 1000 * (granularity === "hour" ? 24 : 3);

    if (when === "before") {
      const datasetMinX = datasetsMinX(datasets);
      newData = await getPowerConsumptionData(
        new Date(datasetMinX - dateOffset),
        new Date(datasetMinX - 1),
        granularity
      );
    } else {
      const datasetMaxX = datasetsMaxX(datasets);
      newData = await getPowerConsumptionData(
        new Date(datasetMaxX + 1),
        new Date(datasetMaxX + dateOffset),
        granularity
      );
    }

    if (newData) {
      const newDatasets = powerConsumptionDataToChartDataset(newData);

      setDatasets((prev) =>
        prev.map((ds) => {
          const match = newDatasets.find((v) => v.yAxisID === ds.yAxisID);
          if (!match) return ds;
          const data =
            when === "before"
              ? match.data.concat(ds.data as Point[])
              : (ds.data as Point[]).concat(match.data);

          // Reduce the number of datapoints in the datasets state by filtering to improve performance
          return {
            ...ds,
            data: filterFarAwayData(data, visibleMinX, visibleMaxX),
          };
        })
      );
    }

    setIsLoading(false);
  };

  const fetchData = async (date: Date) => {
    if (isLoading) return;

    setIsLoading(true);
    const endDate = newDateWithADayAdded(date);
    const newData = await getPowerConsumptionData(date, endDate, granularity);
    if (newData) {
      const newDatasets = powerConsumptionDataToChartDataset(newData);
      setDatasets(newDatasets);
      setVisibleDatasets(newDatasets.map(datasetToVisibleDataset));
    }
    setIsLoading(false);
  };

  const fetchLatestData = async (gran: PowerConsumptionDataGranularity) => {
    setIsLoading(true);

    const newData = await getLatestPowerConsumptionData(gran);
    if (newData) {
      const newDatasets = powerConsumptionDataToChartDataset(newData);
      setDatasets(newDatasets);
      setVisibleDatasets(
        newDatasets.map((ds) => {
          return { ...ds, data: ds.data.slice(-MAX_VISIBLE_DATAPOINT_COUNT) };
        })
      );
    }

    setIsLoading(false);
  };

  const addLatestDatapoint = async (data: PowerConsumptionData) => {
    setDatasets((prev) =>
      prev.map((ds, index) => {
        // Remove first value if there are many stored to improve performance
        if (ds.data.length > 2 * MAX_VISIBLE_DATAPOINT_COUNT) {
          ds.data.shift();
        }
        ds.data.push(powerConsumptionDataToChartData(data, index));
        return { ...ds };
      })
    );

    setVisibleDatasets((prev) =>
      prev.map((ds, index) => {
        if (ds.data.length >= MAX_VISIBLE_DATAPOINT_COUNT) {
          ds.data.shift();
        }
        ds.data.push(powerConsumptionDataToChartData(data, index));
        return { ...ds };
      })
    );
  };

  return {
    isLoading,
    visibleDatasets,
    datasets,
    defaultDate,
    isInitialFetch,
    fetchData,
    fetchLatestData,
    fetchAdditionalData,
    setVisibleDatasets,
    addLatestDatapoint,
  };
};

export default usePowerConsumptionData;
