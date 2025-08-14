from datetime import datetime

from pyflink.datastream import DataStream, FlatMapFunction
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.datastream.functions import AggregateFunction
from pyflink.datastream.connectors.jdbc import JdbcSink
from pyflink.common import Time
from pyflink.table import Row

def select_latest(timestamp1: datetime, timestamp2: datetime):
    return timestamp1 if timestamp1 >= timestamp2 else timestamp2

def select_oldest(timestamp1: datetime, timestamp2: datetime):
    return timestamp1 if timestamp1 <= timestamp2 else timestamp2

class FilterEmptyHourlyEvents(FlatMapFunction):
    def flat_map(self, value):
        if value.event_count > 0:
            yield value

class HourlyPowerConsumptionAggregate(AggregateFunction):
    def create_accumulator(self):
        return Row(
            event_count=0,
            timestamp_start=datetime.now(),
            timestamp_end=datetime.now(),
            global_active_power_sum=0,
            global_reactive_power_sum=0,
            voltage_sum=0,
            global_intensity_sum=0,
            submetering1_sum=0,
            submetering2_sum=0,
            submetering3_sum=0
        )

    def add(self, value, accumulator):
        is_first_event = accumulator.event_count < 1

        return Row(
            event_count=accumulator.event_count + 1,
            timestamp_start=(
                value.timestamp
                if is_first_event
                else select_oldest(accumulator.timestamp_start, value.timestamp) # In-case the events are in the wrong order
            ),
            timestamp_end=(
                value.timestamp
                if is_first_event
                else select_latest(value.timestamp, accumulator.timestamp_end) # In-case the events are in the wrong order
            ),
            global_active_power_sum=accumulator.global_active_power_sum + value.global_active_power,
            global_reactive_power_sum=accumulator.global_reactive_power_sum + value.global_reactive_power,
            voltage_sum=accumulator.voltage_sum + value.voltage,
            global_intensity_sum=accumulator.global_intensity_sum + value.global_intensity,
            submetering1_sum=accumulator.submetering1_sum + value.submetering1,
            submetering2_sum=accumulator.submetering2_sum + value.submetering2,
            submetering3_sum=accumulator.submetering3_sum + value.submetering3
        )

    def get_result(self, accumulator):
        def safe_division(divident: float, divisor: int) -> float:
            """Default to 0 when divisor is 0"""
            return 0 if divisor == 0 else divident / divisor

        return Row(
            event_count=accumulator.event_count,
            timestamp_start=accumulator.timestamp_start,
            timestamp_end=accumulator.timestamp_end,
            global_active_power_avg=safe_division(accumulator.global_active_power_sum, accumulator.event_count),
            global_reactive_power_avg=safe_division(accumulator.global_reactive_power_sum, accumulator.event_count),
            voltage_avg=safe_division(accumulator.voltage_sum, accumulator.event_count),
            global_intensity_avg=safe_division(accumulator.global_intensity_sum, accumulator.event_count),
            submetering1_avg=safe_division(accumulator.submetering1_sum, accumulator.event_count),
            submetering2_avg=safe_division(accumulator.submetering2_sum, accumulator.event_count),
            submetering3_avg=safe_division(accumulator.submetering3_sum, accumulator.event_count)
        )

    def merge(self, a, b):
        # If a or b has no events, return the other one
        if a.event_count < 1:
            return b
        elif b.event_count < 1:
            return a

        return Row(
            event_count=a.event_count + b.event_count,
            timestamp_start=select_oldest(a.timestamp_start, b.timestamp_start),
            timestamp_end=select_latest(a.timestamp_end, b.timestamp_end),
            global_active_power_sum=a.global_active_power_sum + b.global_active_power_sum,
            global_reactive_power_sum=a.global_reactive_power_sum + b.global_reactive_power_sum,
            voltage_sum=a.voltage_sum + b.voltage_sum,
            global_intensity_sum=a.global_intensity_sum + b.global_intensity_sum,
            submetering1_sum=a.submetering1_sum + b.submetering1_sum,
            submetering2_sum=a.submetering2_sum + b.submetering2_sum,
            submetering3_sum=a.submetering3_sum + b.submetering3_sum
        )

def handle_stream(input_stream: DataStream):
    from utils import flink_types, jdbc, postgres

    window_stream = (
        input_stream
        .window_all(TumblingEventTimeWindows.of(Time.seconds(60 * 60))) # 60 minute tumbling windows
        .aggregate(
            HourlyPowerConsumptionAggregate(),
            accumulator_type=flink_types.ACCUMULATOR_EVENT_TYPE,
            output_type=flink_types.HOURLY_EVENT_TYPE,
        )
        .name("Aggregated stream")
    )

    hourly_consumption_stream = window_stream.flat_map(
        FilterEmptyHourlyEvents(),
        output_type=flink_types.HOURLY_EVENT_TYPE,
    ).name("FlatMap: remove aggregations with no events")

    # Save hourly data to Postgres
    hourly_data_postgres_sink = JdbcSink.sink(
        postgres.HOURLY_POWER_CONSUMPTION_DATA_INSERTION_QUERY,
        flink_types.HOURLY_EVENT_TYPE,
        jdbc.jdbc_connection_options,
    )
    hourly_consumption_stream.add_sink(hourly_data_postgres_sink).name("Hourly data Postgres sink")
