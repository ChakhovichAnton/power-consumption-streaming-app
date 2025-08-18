import { getConsumer } from "../lib/kafka.js";
import { TRANSFORMED_DATA_TOPIC } from "../constants.js";
import { ROOMS, EVENT_NAMES } from "./sockets/constants.js";
import { powerConsumptionDataAvroType } from "../lib/avro.js";
import { snakeToCamel } from "../lib/snakeToCamelCase.js";

const consumer = getConsumer("socket-group");

export const startKafkaSocketConsumer = async (io) => {
  await consumer.connect();
  await consumer.subscribe({
    topic: TRANSFORMED_DATA_TOPIC,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message, topic }) => {
      const data = message.value;
      if (!data) return;

      if (topic === TRANSFORMED_DATA_TOPIC) {
        try {
          const decoded = powerConsumptionDataAvroType.fromBuffer(data);

          io.to(ROOMS.POWER_CONSUMPTION_DATA_MINUTE).emit(
            EVENT_NAMES.newMinuteData,
            JSON.stringify(snakeToCamel(decoded))
          );
        } catch (error) {
          console.error("Error in Kafka consumer: ", error);
        }
      }
    },
  });
};
