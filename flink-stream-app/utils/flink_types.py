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
        Types.LONG(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
    ],
)
