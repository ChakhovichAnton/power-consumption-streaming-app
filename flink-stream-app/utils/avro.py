RAW_DATA_SCHEMA = """
{
  "name": "PowerConsumptionData",
  "type": "record",
  "fields": [
    { "name": "timestamp", "type": "long", "logicalType": "timestamp-millis" },
    { "name": "globalActivePower", "type": "float" },
    { "name": "globalReactivePower", "type": "float" },
    { "name": "voltage", "type": "float" },
    { "name": "globalIntensity", "type": "float" },
    { "name": "subMetering1", "type": "float" },
    { "name": "subMetering2", "type": "float" },
    { "name": "subMetering3", "type": "float" }
  ]
}
"""
