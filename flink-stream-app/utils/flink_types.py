from pyflink.common import Types

RAW_EVENT_TYPE = Types.ROW_NAMED(
    [
        "timestamp",
        "globalActivePower",
        "globalReactivePower",
        "voltage",
        "globalIntensity",
        "subMetering1",
        "subMetering2",
        "subMetering3",
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
        "eventCount",
        "timestampStart",
        "timestampEnd",
        "globalActivePowerSum",
        "globalReactivePowerSum",
        "voltageSum",
        "globalIntensitySum",
        "subMetering1Sum",
        "subMetering2Sum",
        "subMetering3Sum",
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
        "eventCount",
        "timestampStart",
        "timestampEnd",
        "globalActivePowerAverage",
        "globalReactivePowerAverage",
        "voltageAverage",
        "globalIntensityAverage",
        "subMetering1Average",
        "subMetering2Average",
        "subMetering3Average",
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
