import logging
import sys

from pyflink.datastream import StreamExecutionEnvironment, TimeCharacteristic
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer
from pyflink.datastream.connectors.jdbc import JdbcSink
from pyflink.datastream.formats.avro import AvroRowDeserializationSchema
from pyflink.common import Duration
from pyflink.common.watermark_strategy import TimestampAssigner, WatermarkStrategy

from utils import kafka, avro, flink_types, postgres, jdbc
from pipelines import hourly_power_consumption_data

class ProcessedDataTimestampAssigner(TimestampAssigner):
    def extract_timestamp(self, value, record_timestamp):
        return int(value["timestamp"].timestamp() * 1000)

def enable_checkpoints(env):
    env.enable_checkpointing(10 * 1000) # start a checkpoint every 10 seconds
    env.get_checkpoint_config().set_checkpoint_storage_dir("file:///flink-checkpoints")

if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    # Create execution environment
    env = StreamExecutionEnvironment.get_execution_environment()
    env.set_parallelism(1)
    env.set_stream_time_characteristic(TimeCharacteristic.EventTime)
    enable_checkpoints(env)

    deserialization_schema = AvroRowDeserializationSchema(
        avro_schema_string=avro.RAW_DATA_SCHEMA
    )

    # Create the Kafka consumer
    consumer = FlinkKafkaConsumer(
        topics=kafka.RAW_DATA_KAFKA_TOPIC,
        deserialization_schema=deserialization_schema,
        properties=kafka.KAFKA_PROPERTIES,
    )
    consumer.set_start_from_earliest()

    # Create the watermark strategy
    watermark_strategy = WatermarkStrategy.for_bounded_out_of_orderness(
        Duration.of_seconds(10)
    ).with_timestamp_assigner(ProcessedDataTimestampAssigner())

    # Start consuming
    source_stream = (
        env.add_source(consumer)
        .name("Raw event from Kafka")
        .assign_timestamps_and_watermarks(watermark_strategy)
        .name("Assign watermarks")
    )
    hourly_power_consumption_data.handle_stream(source_stream)

    # Save incoming raw data to Postgres
    postgres_sink = JdbcSink.sink(
        postgres.POWER_CONSUMPTION_DATA_INSERTION_QUERY,
        flink_types.RAW_EVENT_TYPE,
        jdbc.jdbc_connection_options,
    )
    source_stream.add_sink(postgres_sink).name("Postgres sink")

    env.execute("flink-stream-app")
