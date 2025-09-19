import { v } from 'convex/values';

export const webManageWatchlistArgs = v.object({
  propertyId: v.id('properties'),
  action: v.union(v.literal('add'), v.literal('remove')),
  visitorName: v.string(),
  visitorIdNumber: v.optional(v.string()),
  reason: v.string(),
});

export const webManageWatchlistReturns = v.object({
  success: v.boolean(),
  action: v.string(),
  watchlistEntry: v.object({
    propertyId: v.id('properties'),
    visitorName: v.string(),
    visitorIdNumber: v.optional(v.string()),
    reason: v.string(),
    addedBy: v.id('users'),
    addedAt: v.number(),
    isActive: v.boolean(),
  }),
});

export const webManageWatchlistHandler = async (ctx: any, args: any) => {
  const { propertyId, action, visitorName, visitorIdNumber, reason } = args;

  // Get the current user
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .unique();

  if (!user) {
    throw new Error('User not found');
  }

  if (action === 'add') {
    // Add to watchlist
    const watchlistEntry = await ctx.db.insert('visitorWatchlist', {
      propertyId,
      visitorName,
      visitorIdNumber,
      reason,
      addedBy: user._id,
      addedAt: Date.now(),
      isActive: true,
    });

    return {
      success: true,
      action: 'add',
      watchlistEntry: {
        propertyId,
        visitorName,
        visitorIdNumber,
        reason,
        addedBy: user._id,
        addedAt: Date.now(),
        isActive: true,
      },
    };
  } else {
    // Remove from watchlist
    const existingEntry = await ctx.db
      .query('visitorWatchlist')
      .withIndex('by_property_visitor', (q: any) => q.eq('propertyId', propertyId).eq('visitorName', visitorName))
      .first();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, { isActive: false });
    }

    return {
      success: true,
      action: 'remove',
      watchlistEntry: {
        propertyId,
        visitorName,
        visitorIdNumber,
        reason,
        addedBy: user._id,
        addedAt: Date.now(),
        isActive: false,
      },
    };
  }
};
