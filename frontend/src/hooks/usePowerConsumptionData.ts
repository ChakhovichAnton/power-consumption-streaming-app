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
  powerConsumptionDataToChartDataset,
} from "../utils/chart";
import { newDateWithADayAdded } from "../utils/date";
import type {
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

  const [isFetching, setIsFetching] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [defaultDate, setDefaultDate] = useState(new Date());

  useEffect(() => {
    const fetchInitialData = async () => {
      if (isFetching || !isInitialFetch) return;

      setIsFetching(true);
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
      setIsFetching(false);
    };

    fetchInitialData();
  }, [granularity, isFetching, isInitialFetch]);

  const fetchAdditionalData = async (
    when: "before" | "after", // Fetch data from before or after the current data
    visibleMinX: number,
    visibleMaxX: number
  ) => {
    if (isFetching) return;
    setIsFetching(true);

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
          return { ...ds, data: filterFarAwayData(data, visibleMinX, visibleMaxX) };
        })
      );
    }

    setIsFetching(false);
  };

  const fetchData = async (date: Date) => {
    if (isFetching) return;

    setIsFetching(true);
    const endDate = newDateWithADayAdded(date);
    const newData = await getPowerConsumptionData(date, endDate, granularity);
    if (newData) {
      const newDatasets = powerConsumptionDataToChartDataset(newData);
      setDatasets(newDatasets);
      setVisibleDatasets(newDatasets.map(datasetToVisibleDataset));
    }
    setIsFetching(false);
  };

  return {
    isFetching,
    visibleDatasets,
    datasets,
    defaultDate,
    isInitialFetch,
    fetchData,
    fetchAdditionalData,
    setVisibleDatasets,
  };
};

export default usePowerConsumptionData;
