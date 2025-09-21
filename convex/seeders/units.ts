import { Id } from '../_generated/dataModel';
import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const seedUnits = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    // Get existing data
    const properties = await ctx.db.query('properties').collect();
    const users = await ctx.db.query('users').collect();

    if (properties.length === 0 || users.length === 0) {
      throw new Error('Required data (properties, users) not found.');
    }

    const tenants = users.filter(u => u.role === 'tenant');
    const property1 = properties.find(p => p.name === 'Sunset Apartments') || properties[0];
    const property2 = properties.find(p => p.name === 'Downtown Plaza') || properties[1];
    const property3 = properties.find(p => p.name === 'Garden Residence') || properties[2];

    if (!property1 || !property2 || !property3) {
      throw new Error('Properties not found.');
    }

    const units = [];

    // Create units for Sunset Apartments (property1)
    for (let i = 1; i <= 10; i++) {
      const unitId = await ctx.db.insert('units', {
        propertyId: property1._id,
        unitNumber: `10${i}`,
        unitType: 'apartment',
        floor: Math.floor(i / 4) + 1,
        bedrooms: i % 3 === 0 ? 2 : 1,
        bathrooms: 1,
        squareFootage: 800 + i * 50,
        rentAmount: 2500 + i * 100,
        tenantId: i <= 3 && tenants[i - 1] ? tenants[i - 1]._id : undefined,
        isOccupied: i <= 3,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      units.push(unitId);
    }

    // Create units for Downtown Plaza (property2)
    for (let i = 1; i <= 5; i++) {
      const unitId = await ctx.db.insert('units', {
        propertyId: property2._id,
        unitNumber: `20${i}`,
        unitType: 'condo',
        floor: Math.floor(i / 3) + 1,
        bedrooms: i % 2 === 0 ? 2 : 1,
        bathrooms: 1,
        squareFootage: 900 + i * 60,
        rentAmount: 3000 + i * 150,
        tenantId: undefined,
        isOccupied: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      units.push(unitId);
    }

    // Create units for Garden Residence (property3)
    for (let i = 1; i <= 5; i++) {
      const unitId = await ctx.db.insert('units', {
        propertyId: property3._id,
        unitNumber: `30${i}`,
        unitType: 'apartment',
        floor: Math.floor(i / 3) + 1,
        bedrooms: i % 2 === 0 ? 2 : 1,
        bathrooms: 1,
        squareFootage: 850 + i * 55,
        rentAmount: 2800 + i * 120,
        tenantId: undefined,
        isOccupied: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      units.push(unitId);
    }

    return units.length;
  },
});
