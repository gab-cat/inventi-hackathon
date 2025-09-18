import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getAssetHistoryArgs = {
  paginationOpts: paginationOptsValidator,
  assetId: v.id('assets'),
  action: v.optional(
    v.union(
      v.literal('created'),
      v.literal('check_out'),
      v.literal('check_in'),
      v.literal('assigned'),
      v.literal('unassigned'),
      v.literal('transfer'),
      v.literal('maintenance'),
      v.literal('updated'),
      v.literal('retired'),
      v.literal('reactivated')
    )
  ),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  performedBy: v.optional(v.id('users')),
} as const;

export const getAssetHistoryReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('assetHistory'),
      _creationTime: v.number(),
      assetId: v.id('assets'),
      propertyId: v.id('properties'),
      action: v.string(),
      fromUser: v.optional(v.id('users')),
      toUser: v.optional(v.id('users')),
      fromLocation: v.optional(v.string()),
      toLocation: v.optional(v.string()),
      notes: v.optional(v.string()),
      timestamp: v.number(),
      performedBy: v.id('users'),
      // Joined data
      asset: v.object({
        _id: v.id('assets'),
        name: v.string(),
        assetTag: v.string(),
        category: v.string(),
      }),
      property: v.object({
        _id: v.id('properties'),
        name: v.string(),
        address: v.string(),
      }),
      performer: v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
      }),
      fromUserData: v.optional(
        v.object({
          _id: v.id('users'),
          firstName: v.string(),
          lastName: v.string(),
          email: v.string(),
        })
      ),
      toUserData: v.optional(
        v.object({
          _id: v.id('users'),
          firstName: v.string(),
          lastName: v.string(),
          email: v.string(),
        })
      ),
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
  pageStatus: v.optional(v.union(v.string(), v.null())),
  splitCursor: v.optional(v.string()),
});

type Args = {
  paginationOpts: PaginationOptions;
  assetId: Id<'assets'>;
  action?:
    | 'created'
    | 'check_out'
    | 'check_in'
    | 'assigned'
    | 'unassigned'
    | 'transfer'
    | 'maintenance'
    | 'updated'
    | 'retired'
    | 'reactivated';
  dateFrom?: number;
  dateTo?: number;
  performedBy?: Id<'users'>;
};

export const getAssetHistoryHandler = async (ctx: QueryCtx, args: Args) => {
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

  // Get the asset and verify access
  const asset = await ctx.db.get(args.assetId);
  if (!asset) throw new Error('Asset not found');

  const property = await ctx.db.get(asset.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Build the query
  let base = ctx.db.query('assetHistory').withIndex('by_asset', q => q.eq('assetId', args.assetId));

  // Apply additional filters
  if (args.action) {
    base = base.filter(q => q.eq(q.field('action'), args.action!));
  }
  if (args.dateFrom) {
    base = base.filter(q => q.gte(q.field('timestamp'), args.dateFrom!));
  }
  if (args.dateTo) {
    base = base.filter(q => q.lte(q.field('timestamp'), args.dateTo!));
  }
  if (args.performedBy) {
    base = base.filter(q => q.eq(q.field('performedBy'), args.performedBy!));
  }

  // Order by timestamp (newest first)
  const results = await base.order('desc').paginate(args.paginationOpts);

  // Enrich with related data
  const enrichedPage = await Promise.all(
    results.page.map(async historyEntry => {
      // Get asset info
      const assetData = await ctx.db.get(historyEntry.assetId);
      if (!assetData) throw new Error('Asset not found');

      // Get property info
      const propertyData = await ctx.db.get(historyEntry.propertyId);
      if (!propertyData) throw new Error('Property not found');

      // Get performer info
      const performerData = await ctx.db.get(historyEntry.performedBy);
      if (!performerData) throw new Error('Performer not found');

      // Get from user info if applicable
      let fromUserData = undefined;
      if (historyEntry.fromUser) {
        const fromUser = await ctx.db.get(historyEntry.fromUser);
        if (fromUser) {
          fromUserData = {
            _id: fromUser._id,
            firstName: fromUser.firstName,
            lastName: fromUser.lastName,
            email: fromUser.email,
          };
        }
      }

      // Get to user info if applicable
      let toUserData = undefined;
      if (historyEntry.toUser) {
        const toUser = await ctx.db.get(historyEntry.toUser);
        if (toUser) {
          toUserData = {
            _id: toUser._id,
            firstName: toUser.firstName,
            lastName: toUser.lastName,
            email: toUser.email,
          };
        }
      }

      return {
        ...historyEntry,
        asset: {
          _id: assetData._id,
          name: assetData.name,
          assetTag: assetData.assetTag,
          category: assetData.category,
        },
        property: {
          _id: propertyData._id,
          name: propertyData.name,
          address: propertyData.address,
        },
        performer: {
          _id: performerData._id,
          firstName: performerData.firstName,
          lastName: performerData.lastName,
          email: performerData.email,
        },
        fromUserData,
        toUserData,
      };
    })
  );

  return {
    page: enrichedPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
