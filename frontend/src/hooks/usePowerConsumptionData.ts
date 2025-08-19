import type { ChartDataset, Point } from "chart.js";
import {
  getLatestPowerConsumptionData,
  getPowerConsumptionData,
} from "../services/powerConsumptionService";
import {
  addDatapointToDataset,
  datasetsMaxX,
  datasetsMinX,
  datasetToVisibleDataset,
  filterFarAwayData,
  MAX_VISIBLE_DATAPOINT_COUNT,
  powerConsumptionDataToChartDataset,
} from "../utils/chart";
import {
  getDefaultDateForSelectorFromDataset,
  newDateWithADayAdded,
} from "../utils/date";
import type {
  PowerConsumptionData,
  PowerConsumptionDataGranularity,
  PowerConsumptionResult,
} from "../types";
import { useCallback, useEffect, useState } from "react";
import { minFilter } from "../utils/array";

type LineDataset = ChartDataset<"line">;

const usePowerConsumptionData = (
  granularity: PowerConsumptionDataGranularity
) => {
  const [datasets, setDatasets] = useState<LineDataset[]>([]);
  const [visibleDatasets, setVisibleDatasets] = useState<LineDataset[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [defaultDate, setDefaultDate] = useState(new Date());

  const fetchLatestData = useCallback(
    async (
      visibleDatasetConverstion: (dataset: LineDataset) => LineDataset,
      gran?: PowerConsumptionDataGranularity
    ) => {
      if (isLoading) return;
      setIsLoading(true);

      const result = await getLatestPowerConsumptionData(gran ?? granularity);

      // If it is the first time data is fetched, set default timestamp to open the date picker at the correct time
      if (isInitialFetch) {
        setDefaultDate(getDefaultDateForSelectorFromDataset(result));
        setIsInitialFetch(false);
      }

      if (result) {
        const newDatasets = powerConsumptionDataToChartDataset(result);
        setDatasets(newDatasets);
        setVisibleDatasets(newDatasets.map(visibleDatasetConverstion));
      }
      setIsLoading(false);
    },
    [granularity, isInitialFetch, isLoading]
  );

  useEffect(() => {
    if (isLoading || !isInitialFetch) return;

    fetchLatestData(datasetToVisibleDataset);
  }, [isLoading, isInitialFetch, fetchLatestData]);

  /**
   * Fetch additional data from either the left or the right side of the currently fetched data.
   * After fetching the data, the function removes far away data from the fetched data to improve performance
   * 
   * @param when determines if the data is fetched from before or after the currently fetched data
   */
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

  const addLatestDatapoint = async (data: PowerConsumptionData) => {
    setDatasets((ds) =>
      addDatapointToDataset(
        ds,
        (l) => l > 2 * MAX_VISIBLE_DATAPOINT_COUNT,
        data
      )
    );

    setVisibleDatasets((ds) =>
      addDatapointToDataset(ds, (l) => l >= MAX_VISIBLE_DATAPOINT_COUNT, data)
    );
  };

  const setVisibleDatasetsFromMinX = (minX: number) => {
    setVisibleDatasets(
      datasets.map((ds) => {
        const points = ds.data as Point[];
        const data = minFilter(points, minX, MAX_VISIBLE_DATAPOINT_COUNT);
        return { ...ds, data };
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
    setVisibleDatasetsFromMinX,
    addLatestDatapoint,
  };
};

export default usePowerConsumptionData;
