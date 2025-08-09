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
        if value.eventCount > 0:
            yield value

class HourlyPowerConsumptionAggregate(AggregateFunction):
    def create_accumulator(self):
        return Row(
            eventCount=0,
            timestampStart=datetime.now(),
            timestampEnd=datetime.now(),
            globalActivePowerSum=0,
            globalReactivePowerSum=0,
            voltageSum=0,
            globalIntensitySum=0,
            subMetering1Sum=0,
            subMetering2Sum=0,
            subMetering3Sum=0
        )

    def add(self, value, accumulator):
        is_first_event = accumulator.eventCount < 1

        return Row(
            eventCount=accumulator.eventCount + 1,
            timestampStart=(
                value.timestamp
                if is_first_event
                else select_oldest(accumulator.timestampStart, value.timestamp) # In-case the events are in the wrong order
            ),
            timestampEnd=(
                value.timestamp
                if is_first_event
                else select_latest(value.timestamp, accumulator.timestampEnd) # In-case the events are in the wrong order
            ),
            globalActivePowerSum=accumulator.globalActivePowerSum + value.globalActivePower,
            globalReactivePowerSum=accumulator.globalReactivePowerSum + value.globalReactivePower,
            voltageSum=accumulator.voltageSum + value.voltage,
            globalIntensitySum=accumulator.globalIntensitySum + value.globalIntensity,
            subMetering1Sum=accumulator.subMetering1Sum + value.subMetering1,
            subMetering2Sum=accumulator.subMetering2Sum + value.subMetering2,
            subMetering3Sum=accumulator.subMetering3Sum + value.subMetering3
        )

    def get_result(self, accumulator):
        def safe_division(divident: float, divisor: int) -> float:
            """Default to 0 when divisor is 0"""
            return 0 if divisor == 0 else divident / divisor

        return Row(
            eventCount=accumulator.eventCount,
            timestampStart=accumulator.timestampStart,
            timestampEnd=accumulator.timestampEnd,
            globalActivePowerAverage=safe_division(accumulator.globalActivePowerSum, accumulator.eventCount),
            globalReactivePowerAverage=safe_division(accumulator.globalReactivePowerSum, accumulator.eventCount),
            voltageAverage=safe_division(accumulator.voltageSum, accumulator.eventCount),
            globalIntensityAverage=safe_division(accumulator.globalIntensitySum, accumulator.eventCount),
            subMetering1Average=safe_division(accumulator.subMetering1Sum, accumulator.eventCount),
            subMetering2Average=safe_division(accumulator.subMetering2Sum, accumulator.eventCount),
            subMetering3Average=safe_division(accumulator.subMetering3Sum, accumulator.eventCount)
        )

    def merge(self, a, b):
        # If a or b has no events, return the other one
        if a.eventCount < 1:
            return b
        elif b.eventCount < 1:
            return a

        return Row(
            eventCount=a.eventCount + b.eventCount,
            timestampStart=select_oldest(a.timestampStart, b.timestampStart),
            timestampEnd=select_latest(a.timestampEnd, b.timestampEnd),
            globalActivePowerSum=a.globalActivePowerSum + b.globalActivePowerSum,
            globalReactivePowerSum=a.globalReactivePowerSum + b.globalReactivePowerSum,
            voltageSum=a.voltageSum + b.voltageSum,
            globalIntensitySum=a.globalIntensitySum + b.globalIntensitySum,
            subMetering1Sum=a.subMetering1Sum + b.subMetering1Sum,
            subMetering2Sum=a.subMetering2Sum + b.subMetering2Sum,
            subMetering3Sum=a.subMetering3Sum + b.subMetering3Sum
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
