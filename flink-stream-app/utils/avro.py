RAW_DATA_SCHEMA = """
{
  "name": "PowerConsumptionData",
  "type": "record",
  "fields": [
    {
      "name": "timestamp",
      "type": { "type": "long", "logicalType": "timestamp-millis" }
    },
    { "name": "globalActivePower", "type": ["null", "float"] },
    { "name": "globalReactivePower", "type": ["null", "float"] },
    { "name": "voltage", "type": ["null", "float"] },
    { "name": "globalIntensity", "type": ["null", "float"] },
    { "name": "subMetering1", "type": ["null", "float"] },
    { "name": "subMetering2", "type": ["null", "float"] },
    { "name": "subMetering3", "type": ["null", "float"] }
  ]
}
"""

NOT_NULL_DATA_SCHEMA = """
{
  "name": "PowerConsumptionData",
  "type": "record",
  "fields": [
    {
      "name": "timestamp",
      "type": { "type": "long", "logicalType": "timestamp-millis" }
    },
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
