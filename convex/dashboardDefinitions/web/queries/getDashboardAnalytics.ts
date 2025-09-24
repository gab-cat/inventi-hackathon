import { query, QueryCtx } from '../../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../../_generated/dataModel';

export const webGetDashboardAnalyticsArgs = {
  propertyId: v.id('properties'),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
};

export const webGetDashboardAnalyticsReturns = v.object({
  // Property Overview
  propertyOverview: v.object({
    totalUnits: v.number(),
    occupiedUnits: v.number(),
    occupancyRate: v.number(),
    totalTenants: v.number(),
    activeMaintenanceRequests: v.number(),
    pendingVisitorRequests: v.number(),
    pendingDeliveries: v.number(),
  }),

  // Financial Metrics
  financialMetrics: v.object({
    totalRevenue: v.number(),
    pendingPayments: v.number(),
    overduePayments: v.number(),
    monthlyRevenue: v.number(),
    collectionRate: v.number(),
    maintenanceCosts: v.number(),
  }),

  // Maintenance Metrics
  maintenanceMetrics: v.object({
    totalRequests: v.number(),
    completedThisMonth: v.number(),
    averageResolutionTime: v.number(),
    emergencyRequests: v.number(),
    requestsByPriority: v.object({
      low: v.number(),
      medium: v.number(),
      high: v.number(),
      emergency: v.number(),
    }),
    requestsByType: v.object({
      plumbing: v.number(),
      electrical: v.number(),
      hvac: v.number(),
      appliance: v.number(),
      general: v.number(),
    }),
  }),

  // Communication Metrics
  communicationMetrics: v.object({
    totalMessages: v.number(),
    unreadMessages: v.number(),
    activeThreads: v.number(),
    averageResponseTime: v.number(),
    messagesByType: v.object({
      individual: v.number(),
      group: v.number(),
      maintenance: v.number(),
      emergency: v.number(),
    }),
  }),

  // Visitor Metrics
  visitorMetrics: v.object({
    totalVisitors: v.number(),
    visitorsToday: v.number(),
    pendingApprovals: v.number(),
    approvedToday: v.number(),
    checkInsToday: v.number(),
    checkOutsToday: v.number(),
  }),

  // Delivery Metrics
  deliveryMetrics: v.object({
    totalDeliveries: v.number(),
    deliveriesToday: v.number(),
    pendingCollections: v.number(),
    failedDeliveries: v.number(),
    deliveriesByType: v.object({
      package: v.number(),
      food: v.number(),
      grocery: v.number(),
      mail: v.number(),
      other: v.number(),
    }),
  }),

  // Asset Metrics
  assetMetrics: v.object({
    totalAssets: v.number(),
    availableAssets: v.number(),
    checkedOutAssets: v.number(),
    maintenanceDue: v.number(),
    totalValue: v.number(),
    assetsByCategory: v.object({
      tool: v.number(),
      equipment: v.number(),
      material: v.number(),
      furniture: v.number(),
      appliance: v.number(),
    }),
  }),

  // IoT Metrics
  iotMetrics: v.object({
    totalDevices: v.number(),
    activeDevices: v.number(),
    devicesWithAlerts: v.number(),
    averageBatteryLevel: v.number(),
    anomalyCount: v.number(),
    devicesByType: v.object({
      water_meter: v.number(),
      electricity_meter: v.number(),
      thermostat: v.number(),
      security_camera: v.number(),
    }),
  }),

  // Trends (last 30 days)
  trends: v.object({
    maintenanceTrend: v.array(
      v.object({
        date: v.string(),
        count: v.number(),
      })
    ),
    revenueTrend: v.array(
      v.object({
        date: v.string(),
        amount: v.number(),
      })
    ),
    visitorTrend: v.array(
      v.object({
        date: v.string(),
        count: v.number(),
      })
    ),
    deliveryTrend: v.array(
      v.object({
        date: v.string(),
        count: v.number(),
      })
    ),
  }),
});

type Args = {
  propertyId: Id<'properties'>;
  startDate?: number;
  endDate?: number;
};

export const webGetDashboardAnalyticsHandler = async (ctx: QueryCtx, args: Args) => {
  const { propertyId, startDate, endDate } = args;

  // Get current user
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has access to this property
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', (q: any) => q.eq('userId', user._id).eq('propertyId', propertyId))
    .first();

  if (!userProperty && user.role !== 'manager') {
    throw new Error('Access denied');
  }

  const now = Date.now();
  const start = startDate || now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
  const end = endDate || now;
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayEnd = new Date().setHours(23, 59, 59, 999);

  // Get property info
  const property = await ctx.db.get(propertyId);
  if (!property) {
    throw new Error('Property not found');
  }

  // Get all units for this property
  const units = await ctx.db
    .query('units')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Get all users for this property
  const propertyUsers = await ctx.db
    .query('userProperties')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Get maintenance requests
  const maintenanceRequests = await ctx.db
    .query('maintenanceRequests')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Get visitor requests
  const visitorRequests = await ctx.db
    .query('visitorRequests')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Get visitor logs
  const visitorLogs = await ctx.db
    .query('visitorLogs')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Get deliveries
  const deliveries = await ctx.db
    .query('deliveries')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Get invoices and payments
  const invoices = await ctx.db
    .query('invoices')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  const payments = await ctx.db
    .query('payments')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Get chat threads and messages
  const chatThreads = await ctx.db
    .query('chatThreads')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  const threadIds = chatThreads.map((t: any) => t._id);
  const messages = await ctx.db
    .query('messages')
    .filter((q: any) => q.or(...threadIds.map((id: any) => q.eq(q.field('threadId'), id))))
    .collect();

  // Get assets
  const assets = await ctx.db
    .query('assets')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Get IoT devices
  const iotDevices = await ctx.db
    .query('iotDevices')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  const iotReadings = await ctx.db
    .query('iotReadings')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Calculate Property Overview
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u: any) => u.isOccupied).length;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  const totalTenants = propertyUsers.filter((u: any) => u.role === 'tenant').length;
  const activeMaintenanceRequests = maintenanceRequests.filter((r: any) =>
    ['pending', 'assigned', 'in_progress'].includes(r.status)
  ).length;
  const pendingVisitorRequests = visitorRequests.filter((r: any) => r.status === 'pending').length;
  const pendingDeliveries = deliveries.filter((d: any) => d.status === 'arrived').length;

  // Calculate Financial Metrics
  const totalRevenue = payments
    .filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const pendingPayments = invoices
    .filter((i: any) => i.status === 'pending')
    .reduce((sum: number, i: any) => sum + i.totalAmount, 0);

  const overduePayments = invoices
    .filter((i: any) => i.status === 'overdue')
    .reduce((sum: number, i: any) => sum + i.totalAmount, 0);

  const monthlyRevenue = payments
    .filter((p: any) => p.status === 'completed' && p.processedAt && p.processedAt >= start)
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const totalInvoiced = invoices.reduce((sum: number, i: any) => sum + i.totalAmount, 0);
  const collectionRate = totalInvoiced > 0 ? (totalRevenue / totalInvoiced) * 100 : 0;

  const maintenanceCosts = maintenanceRequests
    .filter((r: any) => r.actualCost && r.status === 'completed')
    .reduce((sum: number, r: any) => sum + (r.actualCost || 0), 0);

  // Calculate Maintenance Metrics
  const completedThisMonth = maintenanceRequests.filter(
    (r: any) => r.status === 'completed' && r.actualCompletion && r.actualCompletion >= start
  ).length;

  const completedRequests = maintenanceRequests.filter((r: any) => r.status === 'completed');
  const averageResolutionTime =
    completedRequests.length > 0
      ? completedRequests.reduce((sum: number, r: any) => {
          const resolutionTime = r.actualCompletion && r.createdAt ? r.actualCompletion - r.createdAt : 0;
          return sum + resolutionTime;
        }, 0) / completedRequests.length
      : 0;

  const emergencyRequests = maintenanceRequests.filter((r: any) => r.priority === 'emergency').length;

  const requestsByPriority = {
    low: maintenanceRequests.filter((r: any) => r.priority === 'low').length,
    medium: maintenanceRequests.filter((r: any) => r.priority === 'medium').length,
    high: maintenanceRequests.filter((r: any) => r.priority === 'high').length,
    emergency: emergencyRequests,
  };

  const requestsByType = {
    plumbing: maintenanceRequests.filter((r: any) => r.requestType === 'plumbing').length,
    electrical: maintenanceRequests.filter((r: any) => r.requestType === 'electrical').length,
    hvac: maintenanceRequests.filter((r: any) => r.requestType === 'hvac').length,
    appliance: maintenanceRequests.filter((r: any) => r.requestType === 'appliance').length,
    general: maintenanceRequests.filter((r: any) => r.requestType === 'general').length,
  };

  // Calculate Communication Metrics
  const unreadMessages = messages.filter((m: any) => !m.isRead).length;
  const activeThreads = chatThreads.filter((t: any) => !t.isArchived).length;

  // Calculate average response time
  const responseTimes: number[] = [];
  for (let i = 1; i < messages.length; i++) {
    const prevMessage = messages[i - 1];
    const currentMessage = messages[i];
    if (prevMessage.senderId !== currentMessage.senderId) {
      responseTimes.push(currentMessage.createdAt - prevMessage.createdAt);
    }
  }
  const averageResponseTime =
    responseTimes.length > 0 ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length : 0;

  const messagesByType = {
    individual: chatThreads.filter((t: any) => t.threadType === 'individual').length,
    group: chatThreads.filter((t: any) => t.threadType === 'group').length,
    maintenance: chatThreads.filter((t: any) => t.threadType === 'maintenance').length,
    emergency: chatThreads.filter((t: any) => t.threadType === 'emergency').length,
  };

  // Calculate Visitor Metrics
  const visitorsToday = visitorLogs.filter(
    (log: any) => log.timestamp >= todayStart && log.timestamp <= todayEnd
  ).length;

  const approvedToday = visitorRequests.filter(
    (r: any) => r.approvedAt && r.approvedAt >= todayStart && r.approvedAt <= todayEnd
  ).length;

  const checkInsToday = visitorLogs.filter(
    (log: any) => log.action === 'check_in' && log.timestamp >= todayStart && log.timestamp <= todayEnd
  ).length;

  const checkOutsToday = visitorLogs.filter(
    (log: any) => log.action === 'check_out' && log.timestamp >= todayStart && log.timestamp <= todayEnd
  ).length;

  // Calculate Delivery Metrics
  const deliveriesToday = deliveries.filter((d: any) => d.createdAt >= todayStart && d.createdAt <= todayEnd).length;

  const failedDeliveries = deliveries.filter((d: any) => d.status === 'failed').length;

  const deliveriesByType = {
    package: deliveries.filter((d: any) => d.deliveryType === 'package').length,
    food: deliveries.filter((d: any) => d.deliveryType === 'food').length,
    grocery: deliveries.filter((d: any) => d.deliveryType === 'grocery').length,
    mail: deliveries.filter((d: any) => d.deliveryType === 'mail').length,
    other: deliveries.filter((d: any) => d.deliveryType === 'other').length,
  };

  // Calculate Asset Metrics
  const availableAssets = assets.filter((a: any) => a.status === 'available').length;
  const checkedOutAssets = assets.filter((a: any) => a.status === 'checked_out').length;
  const maintenanceDue = assets.filter(
    (a: any) =>
      a.maintenanceSchedule && a.maintenanceSchedule.nextMaintenance && a.maintenanceSchedule.nextMaintenance <= now
  ).length;

  const totalValue = assets.reduce((sum: number, a: any) => sum + (a.currentValue || 0), 0);

  const assetsByCategory = {
    tool: assets.filter((a: any) => a.category === 'tool').length,
    equipment: assets.filter((a: any) => a.category === 'equipment').length,
    material: assets.filter((a: any) => a.category === 'material').length,
    furniture: assets.filter((a: any) => a.category === 'furniture').length,
    appliance: assets.filter((a: any) => a.category === 'appliance').length,
  };

  // Calculate IoT Metrics
  const activeDevices = iotDevices.filter((d: any) => d.isActive).length;
  const devicesWithAlerts = iotReadings.filter((r: any) => r.isAnomaly).length;
  const averageBatteryLevel =
    iotReadings.length > 0
      ? iotReadings.reduce((sum: number, r: any) => sum + (r.metadata?.batteryLevel || 0), 0) / iotReadings.length
      : 0;

  const anomalyCount = iotReadings.filter((r: any) => r.isAnomaly).length;

  const devicesByType = {
    water_meter: iotDevices.filter((d: any) => d.deviceType === 'water_meter').length,
    electricity_meter: iotDevices.filter((d: any) => d.deviceType === 'electricity_meter').length,
    thermostat: iotDevices.filter((d: any) => d.deviceType === 'thermostat').length,
    security_camera: iotDevices.filter((d: any) => d.deviceType === 'security_camera').length,
  };

  // Calculate Trends (simplified - you might want to implement proper date aggregation)
  const maintenanceTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now - (29 - i) * 24 * 60 * 60 * 1000);
    const dayStart = date.setHours(0, 0, 0, 0);
    const dayEnd = date.setHours(23, 59, 59, 999);

    const count = maintenanceRequests.filter((r: any) => r.createdAt >= dayStart && r.createdAt <= dayEnd).length;

    return {
      date: date.toISOString().split('T')[0],
      count,
    };
  });

  const revenueTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now - (29 - i) * 24 * 60 * 60 * 1000);
    const dayStart = date.setHours(0, 0, 0, 0);
    const dayEnd = date.setHours(23, 59, 59, 999);

    const amount = payments
      .filter(
        (p: any) => p.status === 'completed' && p.processedAt && p.processedAt >= dayStart && p.processedAt <= dayEnd
      )
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    return {
      date: date.toISOString().split('T')[0],
      amount,
    };
  });

  const visitorTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now - (29 - i) * 24 * 60 * 60 * 1000);
    const dayStart = date.setHours(0, 0, 0, 0);
    const dayEnd = date.setHours(23, 59, 59, 999);

    const count = visitorLogs.filter((log: any) => log.timestamp >= dayStart && log.timestamp <= dayEnd).length;

    return {
      date: date.toISOString().split('T')[0],
      count,
    };
  });

  const deliveryTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now - (29 - i) * 24 * 60 * 60 * 1000);
    const dayStart = date.setHours(0, 0, 0, 0);
    const dayEnd = date.setHours(23, 59, 59, 999);

    const count = deliveries.filter((d: any) => d.createdAt >= dayStart && d.createdAt <= dayEnd).length;

    return {
      date: date.toISOString().split('T')[0],
      count,
    };
  });

  return {
    propertyOverview: {
      totalUnits,
      occupiedUnits,
      occupancyRate,
      totalTenants,
      activeMaintenanceRequests,
      pendingVisitorRequests,
      pendingDeliveries,
    },
    financialMetrics: {
      totalRevenue,
      pendingPayments,
      overduePayments,
      monthlyRevenue,
      collectionRate,
      maintenanceCosts,
    },
    maintenanceMetrics: {
      totalRequests: maintenanceRequests.length,
      completedThisMonth,
      averageResolutionTime,
      emergencyRequests,
      requestsByPriority,
      requestsByType,
    },
    communicationMetrics: {
      totalMessages: messages.length,
      unreadMessages,
      activeThreads,
      averageResponseTime,
      messagesByType,
    },
    visitorMetrics: {
      totalVisitors: visitorRequests.length,
      visitorsToday,
      pendingApprovals: pendingVisitorRequests,
      approvedToday,
      checkInsToday,
      checkOutsToday,
    },
    deliveryMetrics: {
      totalDeliveries: deliveries.length,
      deliveriesToday,
      pendingCollections: pendingDeliveries,
      failedDeliveries,
      deliveriesByType,
    },
    assetMetrics: {
      totalAssets: assets.length,
      availableAssets,
      checkedOutAssets,
      maintenanceDue,
      totalValue,
      assetsByCategory,
    },
    iotMetrics: {
      totalDevices: iotDevices.length,
      activeDevices,
      devicesWithAlerts,
      averageBatteryLevel,
      anomalyCount,
      devicesByType,
    },
    trends: {
      maintenanceTrend,
      revenueTrend,
      visitorTrend,
      deliveryTrend,
    },
  };
};

export const webGetDashboardAnalytics = query({
  args: webGetDashboardAnalyticsArgs,
  returns: webGetDashboardAnalyticsReturns,
  handler: webGetDashboardAnalyticsHandler,
});

export type GetDashboardAnalyticsArgs = typeof webGetDashboardAnalyticsArgs;
export type GetDashboardAnalyticsReturns = typeof webGetDashboardAnalyticsReturns;
