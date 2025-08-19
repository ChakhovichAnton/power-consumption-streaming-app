import {
  validateStartAndEndTimestamps,
  validateGranularity,
} from "./../validators.js";
import {
  getDatesWithData,
  getConsumption,
  getLatestConsumption,
} from "./../services/powerConsumption.js";
import {
  getDatesWithHourlyData,
  getHourlyConsumption,
  getLatestHourlyConsumption,
} from "./../services/hourlyPowerConsumption.js";
import { snakeToCamel } from "./../../lib/snakeToCamelCase.js";

export const getPowerConsumption = async (req, res) => {
  const {
    start,
    end,
    granularity = "hour",
    limit = 500,
    offset = 0,
  } = req.query;

  const {
    start: startTimestamp,
    end: endTimestamp,
    error,
  } = validateStartAndEndTimestamps(start, end);
  if (error) {
    return res.status(400).json(error);
  }

  const granularityIsValid = validateGranularity(granularity);
  if (granularityIsValid !== true) {
    return res.status(400).json(granularityIsValid);
  }

  const consumptionFunction =
    granularity === "hour" ? getHourlyConsumption : getConsumption;

  const result = await consumptionFunction(
    startTimestamp.toISOString(),
    endTimestamp.toISOString(),
    parseInt(limit),
    parseInt(offset)
  );

  res.json({ count: result.rows.length, data: result.rows.map(snakeToCamel) });
};

export const getDatesWithPowerConsumptionData = async (req, res) => {
  const { start, end, granularity = "hour" } = req.query;

  const {
    start: startTimestamp,
    end: endTimestamp,
    error,
  } = validateStartAndEndTimestamps(start, end);
  if (error) {
    return res.status(400).json(error);
  }

  const granularityIsValid = validateGranularity(granularity);
  if (granularityIsValid !== true) {
    return res.status(400).json(granularityIsValid);
  }

  const consumptionFunction =
    granularity === "hour" ? getDatesWithHourlyData : getDatesWithData;

  const result = await consumptionFunction(
    startTimestamp.toISOString(),
    endTimestamp.toISOString()
  );
  const data = result.rows.map((row) => row.date_with_data);
  res.send({ count: data.length, data });
};

export const getLatestPowerConsumptionData = async (req, res) => {
  const { granularity = "hour" } = req.query;

  const granularityIsValid = validateGranularity(granularity);
  if (granularityIsValid !== true) {
    return res.status(400).json(granularityIsValid);
  }

  const consumptionFunction =
    granularity === "hour" ? getLatestHourlyConsumption : getLatestConsumption;

  const result = await consumptionFunction();
  res.send({ count: result.rows.length, data: result.rows.map(snakeToCamel) });
};
