import { Id } from '../_generated/dataModel';
import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const seedWatchlist = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    // Get existing data
    const properties = await ctx.db.query('properties').collect();
    const users = await ctx.db.query('users').collect();

    if (properties.length === 0 || users.length === 0) {
      throw new Error('Required data (properties, users) not found. Please run main seeder first.');
    }

    const manager = users.find(u => u.role === 'manager');
    const property1 = properties.find(p => p.name === 'Sunset Apartments') || properties[0];
    const property2 = properties.find(p => p.name === 'Downtown Plaza') || properties[1];

    if (!manager || !property1 || !property2) {
      throw new Error('Manager or properties not found. Please run main seeder first.');
    }

    const watchlistEntries = [
      // High risk entries
      {
        propertyId: property1._id,
        name: 'John Smith',
        description:
          'Previous tenant with multiple lease violations and property damage. Known for disruptive behavior.',
        riskLevel: 'high' as const,
        isActive: true,
        createdBy: manager._id,
        createdAt: Date.now() - 2592000000, // 30 days ago
        updatedAt: Date.now() - 2592000000,
      },
      {
        propertyId: property1._id,
        name: 'Sarah Johnson',
        description: 'Former resident involved in illegal activities on property premises. Banned from all properties.',
        riskLevel: 'critical' as const,
        isActive: true,
        createdBy: manager._id,
        createdAt: Date.now() - 5184000000, // 60 days ago
        updatedAt: Date.now() - 5184000000,
      },
      // Medium risk entries
      {
        propertyId: property1._id,
        name: 'Mike Davis',
        description: 'Known for frequent noise complaints and unauthorized guests. Requires extra monitoring.',
        riskLevel: 'medium' as const,
        isActive: true,
        createdBy: manager._id,
        createdAt: Date.now() - 1296000000, // 15 days ago
        updatedAt: Date.now() - 1296000000,
      },
      {
        propertyId: property2._id,
        name: 'Lisa Wilson',
        description:
          'Previous visitor with suspicious behavior patterns. Attempted unauthorized access to restricted areas.',
        riskLevel: 'medium' as const,
        isActive: true,
        createdBy: manager._id,
        createdAt: Date.now() - 864000000, // 10 days ago
        updatedAt: Date.now() - 864000000,
      },
      // Low risk entries
      {
        propertyId: property1._id,
        name: 'Robert Brown',
        description: 'Former tenant with payment issues. Generally cooperative but requires payment verification.',
        riskLevel: 'low' as const,
        isActive: true,
        createdBy: manager._id,
        createdAt: Date.now() - 604800000, // 7 days ago
        updatedAt: Date.now() - 604800000,
      },
      {
        propertyId: property2._id,
        name: 'Jennifer Taylor',
        description: 'Previous visitor with minor policy violations. Generally compliant but needs reminder of rules.',
        riskLevel: 'low' as const,
        isActive: true,
        createdBy: manager._id,
        createdAt: Date.now() - 432000000, // 5 days ago
        updatedAt: Date.now() - 432000000,
      },
      // Inactive entries (resolved cases)
      {
        propertyId: property1._id,
        name: 'David Miller',
        description: 'Former tenant with noise complaints. Issue resolved after mediation. No longer active.',
        riskLevel: 'low' as const,
        isActive: false,
        createdBy: manager._id,
        createdAt: Date.now() - 7776000000, // 90 days ago
        updatedAt: Date.now() - 2592000000, // 30 days ago (deactivated)
      },
      {
        propertyId: property2._id,
        name: 'Amanda Garcia',
        description: 'Previous visitor with parking violations. Issue resolved after payment of fines.',
        riskLevel: 'low' as const,
        isActive: false,
        createdBy: manager._id,
        createdAt: Date.now() - 5184000000, // 60 days ago
        updatedAt: Date.now() - 1728000000, // 20 days ago (deactivated)
      },
      // Additional entries for property 2
      {
        propertyId: property2._id,
        name: 'Kevin Anderson',
        description: 'Known for aggressive behavior towards staff. Multiple verbal altercations reported.',
        riskLevel: 'high' as const,
        isActive: true,
        createdBy: manager._id,
        createdAt: Date.now() - 2160000000, // 25 days ago
        updatedAt: Date.now() - 2160000000,
      },
      {
        propertyId: property2._id,
        name: 'Maria Rodriguez',
        description: 'Previous tenant with unauthorized pet violations. Generally cooperative but needs monitoring.',
        riskLevel: 'medium' as const,
        isActive: true,
        createdBy: manager._id,
        createdAt: Date.now() - 1296000000, // 15 days ago
        updatedAt: Date.now() - 1296000000,
      },
    ];

    const watchlistIds = [];
    for (const entry of watchlistEntries) {
      const id = await ctx.db.insert('watchlist', entry);
      watchlistIds.push(id);
    }

    return watchlistIds.length;
  },
});
