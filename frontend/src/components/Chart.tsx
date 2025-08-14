import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  type ChartDataset,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { useEffect, useState } from "react";
import {
  getLatestPowerConsumptionData,
  getPowerConsumptionData,
} from "../services/powerConsumptionService";
import Selector from "./Selector";
import type { PowerConsumptionDataGranularity } from "../types";
import DateSelector from "./DateSelector";
import {
  POWER_CONSUMPTION_CHART_ATTRIBUTES,
  powerConsumptionDataToChartDataset,
} from "../utils/chart";
import { newDateWithADayAdded } from "../utils/date";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

const Chart = () => {
  const [datasets, setDatasets] = useState<ChartDataset<"line">[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [defaultDate, setDefaultDate] = useState<Date>(new Date());
  const [granularity, setGranularity] =
    useState<PowerConsumptionDataGranularity>("hour");

  useEffect(() => {
    const fetchInitialData = async () => {
      if (isFetching || !isInitialFetch) return;

      setIsFetching(true);
      const newData = await getLatestPowerConsumptionData(granularity);
      if (newData.count > 0) {
        if (newData.granularity === "hour") {
          const last = newData.data[newData.count - 1];
          setDefaultDate(new Date(last.timestampStart));
        } else {
          const last = newData.data[newData.count - 1];
          setDefaultDate(new Date(last.timestamp));
        }
      }

      setIsInitialFetch(false);
      setDatasets(powerConsumptionDataToChartDataset(newData));
      setIsFetching(false);
    };

    fetchInitialData();
  }, [granularity, isFetching, isInitialFetch]);

  const fetchData = async (date: Date) => {
    if (isFetching) return;

    setIsFetching(true);
    const endDate = newDateWithADayAdded(date);
    const newData = await getPowerConsumptionData(date, endDate, granularity);
    setDatasets(powerConsumptionDataToChartDataset(newData));
    setIsFetching(false);
  };

  if (isInitialFetch) return <p>Loading...</p>;

  return (
    <>
      <div className="flex gap-2 mb-1">
        <label htmlFor="granularity-selector">Data granularity:</label>
        <Selector
          id="granularity-selector"
          onSelect={(option: string) => {
            setGranularity(option as PowerConsumptionDataGranularity);
          }}
          selected={granularity}
          options={[
            { value: "hour", description: "Hourly" },
            { value: "minute", description: "Minute" },
          ]}
        />
      </div>
      <DateSelector onSelect={fetchData} defaultDate={defaultDate} />
      <Line
        data={{ datasets }}
        options={{
          plugins: { legend: { position: "top" } },
          scales: {
            x: {
              type: "time",
              time: { unit: "minute" },
              title: { display: true, text: "Time" },
            },
            ...Object.assign(
              {},
              ...POWER_CONSUMPTION_CHART_ATTRIBUTES.map(({ yAxis }) => {
                return {
                  [yAxis.key]: {
                    type: "linear",
                    position: "left",
                    display: ({ scale }: { scale: LinearScale }) => {
                      const datasets = scale.chart.data
                        .datasets as ChartDataset<"line">[];

                      return datasets.some(
                        (d, index) =>
                          d.yAxisID === yAxis.key &&
                          scale.chart.isDatasetVisible(index)
                      );
                    },
                    title: {
                      display: true,
                      text: yAxis.text,
                    },
                  },
                };
              })
            ),
          },
        }}
      />
    </>
  );
};

export default Chart;
