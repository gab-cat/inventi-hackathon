import { Infer, v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const handleElectricityMeterReadingArgs = v.object({
  deviceId: v.string(),
  kwh: v.number(), // Kilowatt hours consumed
  timestamp: v.number(),
  batteryLevel: v.optional(v.number()),
  signalStrength: v.optional(v.number()),
  temperature: v.optional(v.number()),
  voltage: v.optional(v.number()),
  current: v.optional(v.number()),
  powerFactor: v.optional(v.number()),
  isSimulated: v.optional(v.boolean()), // For testing/simulated data
});

export const handleElectricityMeterReadingHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof handleElectricityMeterReadingArgs>
) => {
  const {
    deviceId,
    kwh,
    timestamp,
    batteryLevel,
    signalStrength,
    temperature,
    voltage,
    current,
    powerFactor,
    isSimulated = false,
  } = args;

  // Find the IoT device
  const device = await ctx.db
    .query('iotDevices')
    .withIndex('by_device_id', (q) => q.eq('deviceId', deviceId))
    .first();

  if (!device) {
    throw new Error(`IoT device with ID ${deviceId} not found`);
  }

  if (device.deviceType !== 'electricity_meter') {
    throw new Error(`Device ${deviceId} is not an electricity meter`);
  }

  if (!device.isActive) {
    throw new Error(`Device ${deviceId} is not active`);
  }

  // Check for anomalies based on device settings
  let isAnomaly = false;
  let anomalyReason: string | undefined;

  if (device.settings?.alertThresholds) {
    const { min, max } = device.settings.alertThresholds;
    if (min !== undefined && kwh < min) {
      isAnomaly = true;
      anomalyReason = `Consumption ${kwh} kWh is below minimum threshold of ${min}`;
    } else if (max !== undefined && kwh > max) {
      isAnomaly = true;
      anomalyReason = `Consumption ${kwh} kWh exceeds maximum threshold of ${max}`;
    }
  }

  // Insert the reading
  const readingId = await ctx.db.insert('iotReadings', {
    deviceId: device._id,
    propertyId: device.propertyId,
    unitId: device.unitId,
    readingType: 'electricity_consumption',
    value: kwh,
    unit: 'kWh',
    timestamp,
    isAnomaly,
    anomalyReason,
    metadata: {
      batteryLevel,
      signalStrength,
      temperature,
      voltage,
      current,
      powerFactor,
    },
    createdAt: Date.now(),
  });

  // Update device last reading timestamp
  await ctx.db.patch(device._id, {
    lastReadingAt: timestamp,
    updatedAt: Date.now(),
  });

  return {
    success: true,
    readingId,
    deviceId: device._id,
    isAnomaly,
    anomalyReason,
  };
};