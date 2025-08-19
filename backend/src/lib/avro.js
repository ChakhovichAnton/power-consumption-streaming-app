import avro from "avsc";

export const rawPowerConsumptionDataAvroType = avro.Type.forSchema({
  name: "PowerConsumptionData",
  type: "record",
  fields: [
    {
      name: "timestamp",
      type: { type: "long", logicalType: "timestamp-millis" },
    },
    { name: "global_active_power", type: ["null", "float"] },
    { name: "global_reactive_power", type: ["null", "float"] },
    { name: "voltage", type: ["null", "float"] },
    { name: "global_intensity", type: ["null", "float"] },
    { name: "submetering1", type: ["null", "float"] },
    { name: "submetering2", type: ["null", "float"] },
    { name: "submetering3", type: ["null", "float"] },
  ],
});

export const powerConsumptionDataAvroType = avro.Type.forSchema({
  name: "PowerConsumptionData",
  type: "record",
  fields: [
    {
      name: "timestamp",
      type: { type: "long", logicalType: "timestamp-millis" },
    },
    { name: "global_active_power", type: "float" },
    { name: "global_reactive_power", type: "float" },
    { name: "voltage", type: "float" },
    { name: "global_intensity", type: "float" },
    { name: "submetering1", type: "float" },
    { name: "submetering2", type: "float" },
    { name: "submetering3", type: "float" },
  ],
});
