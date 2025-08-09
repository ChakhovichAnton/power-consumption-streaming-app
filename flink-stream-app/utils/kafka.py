KAFKA_PROPERTIES = {
    "bootstrap.servers": "kafka:9092",
    "group.id": "flink_consumer_group",
}

RAW_DATA_KAFKA_TOPIC = "raw_power_consumption_data"

LIVE_DATA_KAFKA_TOPIC = "transformed_power_consumption_data"
