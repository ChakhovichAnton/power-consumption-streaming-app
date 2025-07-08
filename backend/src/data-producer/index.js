import { createReadStream } from "fs";
import { createInterface } from "readline";
import { RAW_DATA_TOPIC } from "../constants.js";
import { producer } from "../lib/kafka.js";
import { rawDataAvroType } from "../lib/avro.js";
import { timeAndDateStringToTimestamp } from "../lib/time.js";

const datapointsToAvro = (datapoints) => {
  return datapoints.map((datapoint) => {
    return { value: rawDataAvroType.toBuffer(datapoint) };
  });
};

const DATA_FILE_PATH = "../data/household_power_consumption.txt";
const LOG_EVERY_X_LINES_PROCESSED = 100_000;
const PRODUCE_DATA_BATCH_SIZE = 10_000;

const main = async () => {
  console.log("Running data-producer");
  await producer.connect();

  try {
    let datapoints = [];
    let lineCounter = 0;

    // Load the txt file
    const fileStream = createReadStream(DATA_FILE_PATH);
    const readLineInterface = createInterface({ input: fileStream });

    for await (const line of readLineInterface) {
      const lineArray = line.split(";");

      // Skip the line with the header
      if (lineArray[0] === "Date") continue;

      const timestamp = timeAndDateStringToTimestamp(
        lineArray[0],
        lineArray[1]
      );

      const data = {
        timestamp,
        globalActivePower: Number(lineArray[2]),
        globalReactivePower: Number(lineArray[3]),
        voltage: Number(lineArray[4]),
        globalIntensity: Number(lineArray[5]),
        subMetering1: Number(lineArray[6]),
        subMetering2: Number(lineArray[7]),
        subMetering3: Number(lineArray[8]),
      };
      datapoints.push(data);

      // Produce datapoints in batches to improve performance
      if (datapoints.length % PRODUCE_DATA_BATCH_SIZE === 0) {
        const messages = datapointsToAvro(datapoints);
        await producer.send({ topic: RAW_DATA_TOPIC, messages });
        datapoints = [];
      }

      // Log progress
      lineCounter++;
      if (lineCounter % LOG_EVERY_X_LINES_PROCESSED === 0) {
        console.log(
          `${new Date().toISOString()} Total lines processed so far: ${lineCounter}`
        );
      }
    }

    // Produce the rest of the data points
    if (datapoints.length > 0) {
      const messages = datapointsToAvro(datapoints);
      await producer.send({ topic: RAW_DATA_TOPIC, messages });
    }
  } catch (e) {
    console.log("Error in data-producer:", e);
  } finally {
    await producer.disconnect();
  }
};

main();
