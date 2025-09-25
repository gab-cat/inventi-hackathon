import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';
import { PaginationOptions } from 'convex/server';

export const webGetMaintenanceUpdatesArgs = v.object({
  paginationOpts: v.object({
    numItems: v.number(),
    cursor: v.union(v.string(), v.null()),
  }),
  requestId: v.optional(v.id('maintenanceRequests')),
  propertyId: v.optional(v.id('properties')),
  status: v.optional(
    v.union(
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('rejected')
    )
  ),
  updatedBy: v.optional(v.id('users')),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
});

export const webGetMaintenanceUpdatesReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('maintenanceUpdates'),
      _creationTime: v.number(),
      requestId: v.id('maintenanceRequests'),
      propertyId: v.id('properties'),
      status: v.union(
        v.literal('pending'),
        v.literal('assigned'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled'),
        v.literal('rejected')
      ),
      description: v.string(),
      updatedBy: v.id('users'),
      photos: v.optional(v.array(v.string())),
      timestamp: v.number(),
      // denormalized fields for convenience
      requestTitle: v.optional(v.string()),
      propertyName: v.optional(v.string()),
      updatedByName: v.optional(v.string()),
      updatedByEmail: v.optional(v.string()),
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.union(v.string(), v.null()),
  pageStatus: v.optional(v.union(v.string(), v.null())),
  splitCursor: v.optional(v.string()),
});

type Args = {
  paginationOpts: PaginationOptions;
  requestId?: Id<'maintenanceRequests'>;
  propertyId?: Id<'properties'>;
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  updatedBy?: Id<'users'>;
  dateFrom?: number;
  dateTo?: number;
};

export const webGetMaintenanceUpdatesHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');

  // Get user's accessible properties
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user', q => q.eq('userId', currentUser._id))
    .collect();

  const accessiblePropertyIds = userProperties.map(up => up.propertyId);

  // Check if user has access to the specific property
  if (args.propertyId) {
    if (!accessiblePropertyIds.includes(args.propertyId)) {
      // Return empty page instead of throwing to avoid breaking UI
      return {
        page: [],
        isDone: true,
        continueCursor: null,
      } as any;
    }
  }

  // Apply filters
  let query;
  if (args.requestId) {
    query = ctx.db.query('maintenanceUpdates').withIndex('by_request', q => q.eq('requestId', args.requestId!));
  } else if (args.propertyId) {
    query = ctx.db.query('maintenanceUpdates').withIndex('by_property', q => q.eq('propertyId', args.propertyId!));
  } else if (args.updatedBy) {
    query = ctx.db.query('maintenanceUpdates').withIndex('by_updated_by', q => q.eq('updatedBy', args.updatedBy!));
  } else {
    // Only return maintenance updates for properties the user has access to
    query = ctx.db.query('maintenanceUpdates').withIndex('by_timestamp');
  }

  // Apply additional filters
  let filteredQuery = query;

  // Filter by accessible properties when no specific property is requested
  if (!args.propertyId && !args.requestId && !args.updatedBy) {
    if (accessiblePropertyIds.length === 0) {
      // Return empty page early
      return {
        page: [],
        isDone: true,
        continueCursor: null,
      } as any;
    }
    filteredQuery = filteredQuery.filter(q =>
      q.or(...accessiblePropertyIds.map(propertyId => q.eq(q.field('propertyId'), propertyId)))
    );
  }

  if (args.status) {
    filteredQuery = filteredQuery.filter(q => q.eq(q.field('status'), args.status));
  }

  if (args.dateFrom) {
    filteredQuery = filteredQuery.filter(q => q.gte(q.field('timestamp'), args.dateFrom!));
  }

  if (args.dateTo) {
    filteredQuery = filteredQuery.filter(q => q.lte(q.field('timestamp'), args.dateTo!));
  }

  const results = await filteredQuery.paginate(args.paginationOpts);

  // Denormalize the results
  const denormalizedPage = await Promise.all(
    results.page.map(async (update: Doc<'maintenanceUpdates'>) => {
      // Get request details
      const request = await ctx.db.get(update.requestId);

      // Get property details
      const property = await ctx.db.get(update.propertyId);

      // Get user details
      const updatedByUser = await ctx.db.get(update.updatedBy);

      return {
        ...update,
        requestTitle: request?.title,
        propertyName: property?.name,
        updatedByName: updatedByUser
          ? `${updatedByUser.firstName || ''} ${updatedByUser.lastName || ''}`.trim()
          : undefined,
        updatedByEmail: updatedByUser?.email,
      };
    })
  );

  return {
    ...results,
    page: denormalizedPage,
    splitCursor: results.splitCursor ?? undefined,
  };
};
