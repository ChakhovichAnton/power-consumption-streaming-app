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
import zoomPlugin from "chartjs-plugin-zoom";
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
  Filler,
  zoomPlugin
);

const Chart = () => {
  const [datasets, setDatasets] = useState<ChartDataset<"line">[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [defaultDate, setDefaultDate] = useState(new Date());
  const [granularity, setGranularity] =
    useState<PowerConsumptionDataGranularity>("hour");

  useEffect(() => {
    const fetchInitialData = async () => {
      if (isFetching || !isInitialFetch) return;

      setIsFetching(true);
      const newData = await getLatestPowerConsumptionData(granularity);
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
        setDatasets(powerConsumptionDataToChartDataset(newData));
      }
      setIsFetching(false);
    };

    fetchInitialData();
  }, [granularity, isFetching, isInitialFetch]);

  const fetchData = async (date: Date) => {
    if (isFetching) return;

    setIsFetching(true);
    const endDate = newDateWithADayAdded(date);
    const newData = await getPowerConsumptionData(date, endDate, granularity);
    if (newData) {
      setDatasets(powerConsumptionDataToChartDataset(newData));
    }
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
          plugins: {
            legend: { position: "top" },
            zoom: {
              pan: {
                enabled: !isFetching,
                mode: "x",
                onPanComplete({ chart }) {
                  const xScale = chart.scales.x;
                  const min = new Date(xScale.min);
                  fetchData(min);
                },
              },
            },
          },
          scales: {
            x: {
              type: "time",
              ticks: {
                autoSkip: true,
                callback: (value, index, ticks) => {
                  const date = new Date(value);
                  const prevDate =
                    index > 0 ? new Date(ticks[index - 1].value) : null;

                  const day = date.getDate();
                  const month = date.getMonth() + 1;
                  const hours = String(date.getHours()).padStart(2, "0");
                  const minutes = String(date.getMinutes()).padStart(2, "0");

                  // Show full date if it is the first tick of the day
                  if (
                    !prevDate ||
                    prevDate.getDate() !== day ||
                    prevDate.getMonth() !== month - 1
                  ) {
                    return `${day}.${month}.${date.getFullYear()} ${hours}:${minutes}`;
                  }
                  return `${hours}:${minutes}`;
                },
              },
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
