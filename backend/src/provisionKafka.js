import { admin } from "./lib/kafka.js";
import { RAW_DATA_TOPIC } from "./constants.js";

const REPLICATION_FACTOR = 1;
const PARTITION_COUNT = 1;
const RECREATE_ALL_TOPICS = true;

export const main = async () => {
  console.log("Provisioning Kafka");
  await admin.connect();

  try {
    const existingTopics = await admin.listTopics();
    const existingTopicsSet = new Set([...existingTopics]);
    console.log(`Existing topics: ${existingTopics}`);

    if (RECREATE_ALL_TOPICS) {
      console.log(`Deleting topics: ${existingTopics}`);
      await admin.deleteTopics({ topics: existingTopics });
      existingTopicsSet.clear();
    }

    if (!existingTopicsSet.has(RAW_DATA_TOPIC)) {
      console.log(`Creating topic: ${RAW_DATA_TOPIC}`);

      await admin.createTopics({
        topics: [
          {
            topic: RAW_DATA_TOPIC,
            replicationFactor: REPLICATION_FACTOR,
            numPartitions: PARTITION_COUNT,
          },
        ],
      });
    }

    console.log("Provisioning completed successfully");
  } catch (e) {
    console.log("Provisioning failed: ", e);
  } finally {
    await admin.disconnect();
  }
};

main();
