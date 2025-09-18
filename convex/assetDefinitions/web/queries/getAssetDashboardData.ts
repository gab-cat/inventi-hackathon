import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getAssetDashboardDataArgs = {
  propertyId: v.optional(v.id('properties')),
} as const;

export const getAssetDashboardDataReturns = v.object({
  // Overview statistics
  totalAssets: v.number(),
  availableAssets: v.number(),
  checkedOutAssets: v.number(),
  maintenanceAssets: v.number(),
  retiredAssets: v.number(),
  lostAssets: v.number(),

  // Condition breakdown
  excellentCondition: v.number(),
  goodCondition: v.number(),
  fairCondition: v.number(),
  poorCondition: v.number(),
  brokenCondition: v.number(),

  // Category breakdown
  tools: v.number(),
  equipment: v.number(),
  materials: v.number(),
  furniture: v.number(),
  appliances: v.number(),

  // Financial overview
  totalPurchaseValue: v.number(),
  totalCurrentValue: v.number(),
  depreciationAmount: v.number(),

  // Maintenance overview
  maintenanceDue: v.number(),
  maintenanceOverdue: v.number(),
  warrantyExpiring: v.number(),
  warrantyExpired: v.number(),

  // Recent activity
  recentCheckouts: v.array(
    v.object({
      _id: v.id('assets'),
      name: v.string(),
      assetTag: v.string(),
      assignedTo: v.optional(v.id('users')),
      assignedAt: v.optional(v.number()),
      assignedUser: v.optional(
        v.object({
          _id: v.id('users'),
          firstName: v.string(),
          lastName: v.string(),
        })
      ),
    })
  ),

  // Alerts
  alerts: v.array(
    v.object({
      type: v.string(),
      message: v.string(),
      severity: v.string(),
      assetId: v.optional(v.id('assets')),
      assetName: v.optional(v.string()),
    })
  ),

  // Location distribution
  locationDistribution: v.array(
    v.object({
      location: v.string(),
      count: v.number(),
      percentage: v.number(),
    })
  ),

  // Utilization trends (last 30 days)
  utilizationTrend: v.array(
    v.object({
      date: v.string(),
      checkouts: v.number(),
      checkins: v.number(),
      netChange: v.number(),
    })
  ),
});

type Args = {
  propertyId?: Id<'properties'>;
};

export const getAssetDashboardDataHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager or field technician
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Get all assets
  let allAssets;
  if (args.propertyId) {
    allAssets = await ctx.db
      .query('assets')
      .withIndex('by_property', q => q.eq('propertyId', args.propertyId!))
      .collect();
  } else {
    allAssets = await ctx.db.query('assets').collect();
  }

  // Calculate overview statistics
  const totalAssets = allAssets.length;
  const availableAssets = allAssets.filter(asset => asset.status === 'available').length;
  const checkedOutAssets = allAssets.filter(asset => asset.status === 'checked_out').length;
  const maintenanceAssets = allAssets.filter(asset => asset.status === 'maintenance').length;
  const retiredAssets = allAssets.filter(asset => asset.status === 'retired').length;
  const lostAssets = allAssets.filter(asset => asset.status === 'lost').length;

  // Calculate condition breakdown
  const excellentCondition = allAssets.filter(asset => asset.condition === 'excellent').length;
  const goodCondition = allAssets.filter(asset => asset.condition === 'good').length;
  const fairCondition = allAssets.filter(asset => asset.condition === 'fair').length;
  const poorCondition = allAssets.filter(asset => asset.condition === 'poor').length;
  const brokenCondition = allAssets.filter(asset => asset.condition === 'broken').length;

  // Calculate category breakdown
  const tools = allAssets.filter(asset => asset.category === 'tool').length;
  const equipment = allAssets.filter(asset => asset.category === 'equipment').length;
  const materials = allAssets.filter(asset => asset.category === 'material').length;
  const furniture = allAssets.filter(asset => asset.category === 'furniture').length;
  const appliances = allAssets.filter(asset => asset.category === 'appliance').length;

  // Calculate financial overview
  const totalPurchaseValue = allAssets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0);
  const totalCurrentValue = allAssets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
  const depreciationAmount = totalPurchaseValue - totalCurrentValue;

  // Calculate maintenance overview
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  let maintenanceDue = 0;
  let maintenanceOverdue = 0;
  let warrantyExpiring = 0;
  let warrantyExpired = 0;

  allAssets.forEach(asset => {
    if (asset.maintenanceSchedule?.nextMaintenance) {
      if (asset.maintenanceSchedule.nextMaintenance <= now) {
        maintenanceOverdue++;
      } else if (asset.maintenanceSchedule.nextMaintenance <= now + 7 * oneDay) {
        maintenanceDue++;
      }
    }

    if (asset.warrantyExpiry) {
      if (asset.warrantyExpiry <= now) {
        warrantyExpired++;
      } else if (asset.warrantyExpiry <= now + 30 * oneDay) {
        warrantyExpiring++;
      }
    }
  });

  // Get recent checkouts (last 7 days)
  const sevenDaysAgo = now - 7 * oneDay;
  const recentCheckouts = allAssets
    .filter(asset => asset.assignedAt && asset.assignedAt >= sevenDaysAgo)
    .sort((a, b) => (b.assignedAt || 0) - (a.assignedAt || 0))
    .slice(0, 10);

  // Enrich recent checkouts with user data
  const enrichedRecentCheckouts = await Promise.all(
    recentCheckouts.map(async asset => {
      let assignedUser = undefined;
      if (asset.assignedTo) {
        const user = await ctx.db.get(asset.assignedTo);
        if (user) {
          assignedUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        }
      }

      return {
        _id: asset._id,
        name: asset.name,
        assetTag: asset.assetTag,
        assignedTo: asset.assignedTo,
        assignedAt: asset.assignedAt,
        assignedUser,
      };
    })
  );

  // Generate alerts
  const alerts: Array<{
    type: string;
    message: string;
    severity: string;
    assetId?: Id<'assets'>;
    assetName?: string;
  }> = [];

  // Maintenance alerts
  allAssets.forEach(asset => {
    if (asset.maintenanceSchedule?.nextMaintenance) {
      if (asset.maintenanceSchedule.nextMaintenance <= now) {
        alerts.push({
          type: 'maintenance_overdue',
          message: `Maintenance overdue for ${asset.name}`,
          severity: 'high',
          assetId: asset._id,
          assetName: asset.name,
        });
      } else if (asset.maintenanceSchedule.nextMaintenance <= now + 7 * oneDay) {
        alerts.push({
          type: 'maintenance_due',
          message: `Maintenance due soon for ${asset.name}`,
          severity: 'medium',
          assetId: asset._id,
          assetName: asset.name,
        });
      }
    }

    if (asset.warrantyExpiry) {
      if (asset.warrantyExpiry <= now) {
        alerts.push({
          type: 'warranty_expired',
          message: `Warranty expired for ${asset.name}`,
          severity: 'medium',
          assetId: asset._id,
          assetName: asset.name,
        });
      } else if (asset.warrantyExpiry <= now + 30 * oneDay) {
        alerts.push({
          type: 'warranty_expiring',
          message: `Warranty expiring soon for ${asset.name}`,
          severity: 'low',
          assetId: asset._id,
          assetName: asset.name,
        });
      }
    }
  });

  // Calculate location distribution
  const locationCounts: Record<string, number> = {};
  allAssets.forEach(asset => {
    locationCounts[asset.location] = (locationCounts[asset.location] || 0) + 1;
  });

  const locationDistribution = Object.entries(locationCounts)
    .map(([location, count]) => ({
      location,
      count,
      percentage: totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate utilization trend (last 30 days)
  const thirtyDaysAgo = now - 30 * oneDay;
  const utilizationTrend: Array<{
    date: string;
    checkouts: number;
    checkins: number;
    netChange: number;
  }> = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * oneDay);
    const dateStr = date.toISOString().split('T')[0];

    // Get checkouts and checkins for this date
    const dayStart = date.getTime();
    const dayEnd = dayStart + oneDay;

    const dayCheckouts = await ctx.db
      .query('assetHistory')
      .withIndex('by_timestamp', q => q.gte('timestamp', dayStart))
      .filter(q => q.lt(q.field('timestamp'), dayEnd))
      .filter(q => q.eq(q.field('action'), 'check_out'))
      .collect();

    const dayCheckins = await ctx.db
      .query('assetHistory')
      .withIndex('by_timestamp', q => q.gte('timestamp', dayStart))
      .filter(q => q.lt(q.field('timestamp'), dayEnd))
      .filter(q => q.eq(q.field('action'), 'check_in'))
      .collect();

    utilizationTrend.push({
      date: dateStr,
      checkouts: dayCheckouts.length,
      checkins: dayCheckins.length,
      netChange: dayCheckouts.length - dayCheckins.length,
    });
  }

  return {
    totalAssets,
    availableAssets,
    checkedOutAssets,
    maintenanceAssets,
    retiredAssets,
    lostAssets,
    excellentCondition,
    goodCondition,
    fairCondition,
    poorCondition,
    brokenCondition,
    tools,
    equipment,
    materials,
    furniture,
    appliances,
    totalPurchaseValue,
    totalCurrentValue,
    depreciationAmount,
    maintenanceDue,
    maintenanceOverdue,
    warrantyExpiring,
    warrantyExpired,
    recentCheckouts: enrichedRecentCheckouts,
    alerts,
    locationDistribution,
    utilizationTrend,
  };
};
