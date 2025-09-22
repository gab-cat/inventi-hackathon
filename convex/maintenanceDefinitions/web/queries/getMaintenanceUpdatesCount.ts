import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetMaintenanceUpdatesCountArgs = v.object({
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

export const webGetMaintenanceUpdatesCountReturns = v.object({
  count: v.number(),
});

type Args = {
  requestId?: Id<'maintenanceRequests'>;
  propertyId?: Id<'properties'>;
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  updatedBy?: Id<'users'>;
  dateFrom?: number;
  dateTo?: number;
};

export const webGetMaintenanceUpdatesCountHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');

  // Check if user has access to the property
  if (args.propertyId) {
    const userProperty = await ctx.db
      .query('userProperties')
      .withIndex('by_user_property', q => q.eq('userId', currentUser._id).eq('propertyId', args.propertyId!))
      .first();
    if (!userProperty) throw new Error('Access denied to property');
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
    query = ctx.db.query('maintenanceUpdates').withIndex('by_timestamp');
  }

  // Count with filters
  let filteredQuery = query;

  if (args.status) {
    filteredQuery = filteredQuery.filter(q => q.eq(q.field('status'), args.status));
  }

  if (args.dateFrom) {
    filteredQuery = filteredQuery.filter(q => q.gte(q.field('timestamp'), args.dateFrom!));
  }

  if (args.dateTo) {
    filteredQuery = filteredQuery.filter(q => q.lte(q.field('timestamp'), args.dateTo!));
  }

  const count = await filteredQuery.collect().then(results => results.length);

  return { count };
};
