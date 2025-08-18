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
  type Point,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import { useState } from "react";
import Selector from "./Selector";
import type { PowerConsumptionDataGranularity } from "../types";
import DateSelector from "./DateSelector";
import {
  datasetsMaxX,
  datasetsMinX,
  MAX_VISIBLE_DATAPOINT_COUNT,
  POWER_CONSUMPTION_CHART_ATTRIBUTES,
} from "../utils/chart";
import { minFilter, takeRightWhileCount, takeWhileCount } from "../utils/array";
import usePowerConsumptionData from "../hooks/usePowerConsumptionData";
import LiveButton from "./LiveButton";
import useSocketIOForPowerConsumptionData from "../hooks/useSocketIOForPowerConsumptionData";
import Loading from "./Loading";

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
  const [isLive, setIsLive] = useState(false);
  const [granularity, setGranularity] =
    useState<PowerConsumptionDataGranularity>("hour");

  const {
    datasets,
    visibleDatasets,
    isInitialFetch,
    defaultDate,
    isLoading,
    fetchAdditionalData,
    fetchData,
    fetchLatestData,
    setVisibleDatasets,
    addLatestDatapoint,
  } = usePowerConsumptionData(granularity);

  const { subscribe, unsubscribe } = useSocketIOForPowerConsumptionData(
    isLive,
    addLatestDatapoint
  );

  const onLiveButtonClick = () => {
    const newIsLive = !isLive;
    setIsLive((prev) => !prev);

    if (newIsLive) {
      setGranularity("minute");
      fetchLatestData("minute");
      subscribe();
    } else {
      unsubscribe();
    }
  };

  if (isInitialFetch) return <Loading />;

  const allDataIsVisible =
    datasets.length === 0 ||
    datasets[0].data.length === 0 ||
    datasets[0].data.length === visibleDatasets[0].data.length;

  return (
    <>
      <div className="flex flex-col gap-y-1 sm:flex-row justify-between mb-1">
        <div className="flex items-center gap-1">
          <label htmlFor="granularity-selector" className="font-medium text-gray-700">Data granularity:</label>
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
        <div className="flex gap-2">
          <DateSelector
            granularity={granularity}
            onSelect={fetchData}
            defaultDate={defaultDate}
          />
          <LiveButton
            isLive={isLive}
            onClick={onLiveButtonClick}
            disabled={isLoading}
          />
        </div>
      </div>
      <Line
        data={{ datasets: visibleDatasets }}
        options={{
          plugins: {
            legend: { position: "top" },
            zoom: {
              pan: {
                enabled: !isLoading,
                mode: "x",
                onPan({ chart }) {
                  if (datasets.length < 1 || visibleDatasets.length < 1) return;
                  const { min } = chart.scales.x;

                  if (isLive) {
                    setIsLive(false);
                    unsubscribe();
                  }

                  setVisibleDatasets(
                    datasets.map((ds) => {
                      const data = minFilter(
                        ds.data as Point[],
                        min,
                        MAX_VISIBLE_DATAPOINT_COUNT
                      );
                      return { ...ds, data };
                    })
                  );
                },
                onPanComplete({ chart }) {
                  if (datasets.length < 1) return;
                  const { min, max } = chart.scales.x;

                  const beforeMinCount = takeWhileCount(
                    datasets[0].data,
                    (value) => (value as Point).x < min
                  );
                  const afterMaxCount = takeRightWhileCount(
                    datasets[0].data,
                    (value) => (value as Point).x > max
                  );

                  if (beforeMinCount < 10) {
                    fetchAdditionalData("before", min, max);
                  }
                  if (afterMaxCount < 10) {
                    fetchAdditionalData("after", min, max);
                  }
                },
              },
              zoom: {
                wheel: { enabled: !isLoading },
                pinch: { enabled: !isLoading },
                mode: "x",
              },
              limits: {
                x: {
                  min: allDataIsVisible ? undefined : datasetsMinX(datasets),
                  max: allDataIsVisible ? undefined : datasetsMaxX(datasets),
                },
              },
            },
          },
          scales: {
            x: {
              type: "time",
              ticks: {
                // Show the date and the time on the first tick and whenever the date changes.
                // Otherwise show only the time to reduce the amount of labeling text
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
            // Display multiple y-axis for different datasets as they have different units
            ...Object.assign(
              {},
              ...POWER_CONSUMPTION_CHART_ATTRIBUTES.map(({ yAxis }) => {
                return {
                  [yAxis.key]: {
                    type: "linear",
                    position: "left",
                    display: ({ scale }: { scale: LinearScale }) => {
                      // Display axis only if the related data is available
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
