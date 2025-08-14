import logging
import sys

from pyflink.datastream import StreamExecutionEnvironment, TimeCharacteristic, FlatMapFunction
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer, FlinkKafkaProducer
from pyflink.datastream.connectors.jdbc import JdbcSink
from pyflink.datastream.formats.avro import AvroRowDeserializationSchema, AvroRowSerializationSchema
from pyflink.common import Duration
from pyflink.common.watermark_strategy import TimestampAssigner, WatermarkStrategy

from utils import kafka, avro, flink_types, postgres, jdbc
from pipelines import hourly_power_consumption_data

class FilterEventsWithNullValues(FlatMapFunction):
    def flat_map(self, value):
        if (value.global_active_power is not None and
            value.global_reactive_power is not None and
            value.voltage is not None and
            value.global_intensity is not None and
            value.submetering1 is not None and
            value.submetering2 is not None and
            value.submetering3 is not None
        ):
            yield value

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

    # Remove events with null values
    null_events_removed_stream = source_stream.flat_map(
        FilterEventsWithNullValues(),
        output_type=flink_types.RAW_EVENT_TYPE,
    ).name("FlatMap: remove events with null values")

    # Transform data into hourly aggregated data
    hourly_power_consumption_data.handle_stream(null_events_removed_stream)

    # Send the streamed data to a Kafka topic
    serialization_schema = AvroRowSerializationSchema(
        avro_schema_string=avro.NOT_NULL_DATA_SCHEMA
    )
    kafka_producer = FlinkKafkaProducer(
        topic=kafka.LIVE_DATA_KAFKA_TOPIC,
        serialization_schema=serialization_schema,
        producer_config=kafka.KAFKA_PROPERTIES,
    )
    null_events_removed_stream.add_sink(kafka_producer).name("Kafka producer")

    # Save incoming raw data to Postgres
    postgres_sink = JdbcSink.sink(
        postgres.POWER_CONSUMPTION_DATA_INSERTION_QUERY,
        flink_types.RAW_EVENT_TYPE,
        jdbc.jdbc_connection_options,
    )
    null_events_removed_stream.add_sink(postgres_sink).name("Raw data Postgres sink")

    env.execute("flink-stream-app")
