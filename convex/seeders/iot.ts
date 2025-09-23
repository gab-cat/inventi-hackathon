import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { Id } from '../_generated/dataModel';

export const seedIoT = mutation({
  args: {},
  returns: v.object({
    devices: v.number(),
    readings: v.number(),
  }),
  handler: async ctx => {
    // Check if IoT devices already exist
    const existingDevices = await ctx.db.query('iotDevices').collect();
    if (existingDevices.length > 0) {
      const existingReadings = await ctx.db.query('iotReadings').collect();
      return {
        devices: existingDevices.length,
        readings: existingReadings.length,
      };
    }

    // Get existing data to reference
    const users = await ctx.db.query('users').collect();
    const properties = await ctx.db.query('properties').collect();
    const units = await ctx.db.query('units').collect();

    if (users.length === 0 || properties.length === 0) {
      throw new Error('No users or properties found. Please run the main seed first.');
    }

    // Find the specific user (catimbanggabriel@gmail.com) and associate IoT data with their properties
    // If they don't have properties, we'll associate with the first available property and link the user
    const targetUser = users.find(u => u.email === 'catimbanggabriel@gmail.com');
    if (!targetUser) {
      throw new Error('Target user catimbanggabriel@gmail.com not found. Please ensure this user exists first.');
    }

    // Get properties managed by this user, or if none, use the first property
    let userProperties = properties.filter(p => p.managerId === targetUser._id);
    if (userProperties.length === 0) {
      // User doesn't manage properties, use first property and associate the user with it
      userProperties = [properties[0]];
      console.log(`Associating IoT devices with property "${userProperties[0].name}" for user catimbanggabriel@gmail.com`);
    }

    // Get units for these properties
    const propertyIds = userProperties.map(p => p._id);
    const userUnits = units.filter(u => propertyIds.includes(u.propertyId));

    console.log(`Seeding IoT devices for ${userProperties.length} properties and ${userUnits.length} units`);

    const devices = [];
    const readings = [];

    // Create IoT devices for each property
    for (const property of userProperties) {
      const propertyUnits = userUnits.filter(u => u.propertyId === property._id);

      // Water meters for each unit
      for (const unit of propertyUnits.slice(0, 3)) { // Limit to 3 units per property
        const waterMeterId = `WM-${property._id.slice(-8)}-${unit._id.slice(-4)}`;
        const waterMeter = await ctx.db.insert('iotDevices', {
          propertyId: property._id,
          unitId: unit._id,
          deviceId: waterMeterId,
          deviceType: 'water_meter',
          deviceName: `Water Meter - Unit ${unit.unitNumber}`,
          location: `Unit ${unit.unitNumber}, ${property.name}`,
          manufacturer: 'SmartFlow',
          model: 'SF-2000',
          serialNumber: `SF-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          isActive: true,
          settings: {
            readingInterval: 3600000, // 1 hour
            alertThresholds: {
              min: 0,
              max: 500, // gallons per hour
            },
            unit: 'gallons',
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        devices.push(waterMeter);

        // Generate some historical readings for the water meter
        const now = Date.now();
        for (let i = 23; i >= 0; i--) {
          const timestamp = now - (i * 60 * 60 * 1000); // Every hour for 24 hours
          const baseValue = 50 + Math.random() * 100; // Base consumption 50-150 gallons
          const isAnomaly = Math.random() < 0.05; // 5% chance of anomaly

          const reading = await ctx.db.insert('iotReadings', {
            deviceId: waterMeter,
            propertyId: property._id,
            unitId: unit._id,
            readingType: 'water_consumption',
            value: isAnomaly ? baseValue * 3 : baseValue, // Anomalies are 3x normal
            unit: 'gallons',
            timestamp,
            isAnomaly,
            anomalyReason: isAnomaly ? 'Unusually high water consumption detected' : undefined,
            metadata: {
              batteryLevel: 85 + Math.random() * 15, // 85-100%
              signalStrength: 70 + Math.random() * 30, // 70-100%
              temperature: 20 + Math.random() * 10, // 20-30°C
            },
            createdAt: timestamp,
          });
          readings.push(reading);
        }

        // Update device last reading
        await ctx.db.patch(waterMeter, {
          lastReadingAt: now,
        });
      }

      // Electricity meters for each unit
      for (const unit of propertyUnits.slice(0, 3)) { // Limit to 3 units per property
        const electricityMeterId = `EM-${property._id.slice(-8)}-${unit._id.slice(-4)}`;
        const electricityMeter = await ctx.db.insert('iotDevices', {
          propertyId: property._id,
          unitId: unit._id,
          deviceId: electricityMeterId,
          deviceType: 'electricity_meter',
          deviceName: `Electricity Meter - Unit ${unit.unitNumber}`,
          location: `Unit ${unit.unitNumber}, ${property.name}`,
          manufacturer: 'PowerSense',
          model: 'PS-3000',
          serialNumber: `PS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          isActive: true,
          settings: {
            readingInterval: 1800000, // 30 minutes
            alertThresholds: {
              min: 0,
              max: 50, // kWh per 30 minutes
            },
            unit: 'kWh',
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        devices.push(electricityMeter);

        // Generate some historical readings for the electricity meter
        const now = Date.now();
        for (let i = 47; i >= 0; i--) {
          const timestamp = now - (i * 30 * 60 * 1000); // Every 30 minutes for 24 hours
          const baseValue = 2 + Math.random() * 8; // Base consumption 2-10 kWh
          const isAnomaly = Math.random() < 0.03; // 3% chance of anomaly

          const reading = await ctx.db.insert('iotReadings', {
            deviceId: electricityMeter,
            propertyId: property._id,
            unitId: unit._id,
            readingType: 'electricity_consumption',
            value: isAnomaly ? baseValue * 4 : baseValue, // Anomalies are 4x normal
            unit: 'kWh',
            timestamp,
            isAnomaly,
            anomalyReason: isAnomaly ? 'Spike in electricity consumption detected' : undefined,
            metadata: {
              batteryLevel: 90 + Math.random() * 10, // 90-100%
              signalStrength: 75 + Math.random() * 25, // 75-100%
              temperature: 25 + Math.random() * 15, // 25-40°C
              voltage: 220 + (Math.random() - 0.5) * 20, // 210-230V
              current: 5 + Math.random() * 15, // 5-20A
              powerFactor: 0.85 + Math.random() * 0.15, // 0.85-1.0
            },
            createdAt: timestamp,
          });
          readings.push(reading);
        }

        // Update device last reading
        await ctx.db.patch(electricityMeter, {
          lastReadingAt: now,
        });
      }

      // Add a thermostat for the common area
      const thermostatId = `TH-${property._id.slice(-8)}-COMMON`;
      const thermostat = await ctx.db.insert('iotDevices', {
        propertyId: property._id,
        unitId: undefined, // Common area device
        deviceId: thermostatId,
        deviceType: 'thermostat',
        deviceName: `Thermostat - Common Area`,
        location: `Common Area, ${property.name}`,
        manufacturer: 'ClimateControl',
        model: 'CC-1000',
        serialNumber: `CC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        isActive: true,
        settings: {
          readingInterval: 300000, // 5 minutes
          alertThresholds: {
            min: 18, // 18°C
            max: 28, // 28°C
          },
          unit: 'celsius',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      devices.push(thermostat);

      // Generate temperature readings for the thermostat
      const now = Date.now();
      for (let i = 287; i >= 0; i--) { // Every 5 minutes for 24 hours
        const timestamp = now - (i * 5 * 60 * 1000);
        const baseTemp = 22 + (Math.random() - 0.5) * 6; // Base temp 19-25°C
        const isAnomaly = Math.random() < 0.02; // 2% chance of anomaly

        const reading = await ctx.db.insert('iotReadings', {
          deviceId: thermostat,
          propertyId: property._id,
          unitId: undefined,
          readingType: 'temperature',
          value: isAnomaly ? baseTemp + 10 : baseTemp, // Anomalies are 10°C higher
          unit: 'celsius',
          timestamp,
          isAnomaly,
          anomalyReason: isAnomaly ? 'Unusually high temperature detected' : undefined,
          metadata: {
            batteryLevel: 95 + Math.random() * 5, // 95-100%
            signalStrength: 80 + Math.random() * 20, // 80-100%
          },
          createdAt: timestamp,
        });
        readings.push(reading);
      }

      // Update device last reading
      await ctx.db.patch(thermostat, {
        lastReadingAt: now,
      });
    }

    console.log(`Created ${devices.length} IoT devices and ${readings.length} readings`);

    return {
      devices: devices.length,
      readings: readings.length,
    };
  },
});
