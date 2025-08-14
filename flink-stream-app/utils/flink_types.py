from pyflink.common import Types

RAW_EVENT_TYPE = Types.ROW_NAMED(
    [
        "timestamp",
        "global_active_power",
        "global_reactive_power",
        "voltage",
        "global_intensity",
        "submetering1",
        "submetering2",
        "submetering3",
    ],
    [
        Types.SQL_TIMESTAMP(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
    ],
)

ACCUMULATOR_EVENT_TYPE = Types.ROW_NAMED(
    [
        "event_count",
        "timestamp_start",
        "timestamp_end",
        "global_active_power_sum",
        "global_reactive_power_sum",
        "voltage_sum",
        "global_intensity_sum",
        "submetering1_sum",
        "submetering2_sum",
        "submetering3_sum",
    ],
    [
        Types.INT(),
        Types.SQL_TIMESTAMP(),
        Types.SQL_TIMESTAMP(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
    ],
)

HOURLY_EVENT_TYPE = Types.ROW_NAMED(
    [
        "event_count",
        "timestamp_start",
        "timestamp_end",
        "global_active_power_avg",
        "global_reactive_power_avg",
        "voltage_avg",
        "global_intensity_avg",
        "submetering1_avg",
        "submetering2_avg",
        "submetering3_avg",
    ],
    [
        Types.INT(),
        Types.SQL_TIMESTAMP(),
        Types.SQL_TIMESTAMP(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
    ],
)
