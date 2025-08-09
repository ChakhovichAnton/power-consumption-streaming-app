import avro from "avsc";

export const rawDataAvroType = avro.Type.forSchema({
  name: "PowerConsumptionData",
  type: "record",
  fields: [
    {
      name: "timestamp",
      type: { type: "long", logicalType: "timestamp-millis" },
    },
    { name: "globalActivePower", type: ["null", "float"] },
    { name: "globalReactivePower", type: ["null", "float"] },
    { name: "voltage", type: ["null", "float"] },
    { name: "globalIntensity", type: ["null", "float"] },
    { name: "subMetering1", type: ["null", "float"] },
    { name: "subMetering2", type: ["null", "float"] },
    { name: "subMetering3", type: ["null", "float"] },
  ],
});
