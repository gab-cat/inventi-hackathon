import { Infer, v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const handleWaterMeterReadingArgs = v.object({
  deviceId: v.string(),
  volume: v.number(), // Volume in gallons or liters
  timestamp: v.number(),
  unit: v.string(), // "gallons", "liters"
  batteryLevel: v.optional(v.number()),
  signalStrength: v.optional(v.number()),
  temperature: v.optional(v.number()),
  isSimulated: v.optional(v.boolean()), // For testing/simulated data
});

export const handleWaterMeterReadingHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof handleWaterMeterReadingArgs>
) => {
  const {
    deviceId,
    volume,
    timestamp,
    unit,
    batteryLevel,
    signalStrength,
    temperature,
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

  if (device.deviceType !== 'water_meter') {
    throw new Error(`Device ${deviceId} is not a water meter`);
  }

  if (!device.isActive) {
    throw new Error(`Device ${deviceId} is not active`);
  }

  // Check for anomalies based on device settings
  let isAnomaly = false;
  let anomalyReason: string | undefined;

  if (device.settings?.alertThresholds) {
    const { min, max } = device.settings.alertThresholds;
    if (min !== undefined && volume < min) {
      isAnomaly = true;
      anomalyReason = `Volume ${volume} ${unit} is below minimum threshold of ${min}`;
    } else if (max !== undefined && volume > max) {
      isAnomaly = true;
      anomalyReason = `Volume ${volume} ${unit} exceeds maximum threshold of ${max}`;
    }
  }

  // Insert the reading
  const readingId = await ctx.db.insert('iotReadings', {
    deviceId: device._id,
    propertyId: device.propertyId,
    unitId: device.unitId,
    readingType: 'water_consumption',
    value: volume,
    unit,
    timestamp,
    isAnomaly,
    anomalyReason,
    metadata: {
      batteryLevel,
      signalStrength,
      temperature,
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