import { HOST } from "../constants.js";
import { Kafka } from "kafkajs";

const kafka = new Kafka({ brokers: [`${HOST}:9094`] });

export const admin = kafka.admin();

export const producer = kafka.producer();

export const getConsumer = (consumerGroupId) => {
  return kafka.consumer({ groupId: consumerGroupId, fromBeginning: true });
};
