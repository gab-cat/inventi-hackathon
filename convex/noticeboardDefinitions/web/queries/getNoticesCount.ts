import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetNoticesCountArgs = {
  propertyId: v.optional(v.id('properties')),
  unitId: v.optional(v.id('units')),
  noticeType: v.optional(
    v.union(
      v.literal('announcement'),
      v.literal('maintenance'),
      v.literal('payment_reminder'),
      v.literal('emergency'),
      v.literal('event'),
      v.literal('general')
    )
  ),
  priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'))),
  targetAudience: v.optional(
    v.union(v.literal('all'), v.literal('tenants'), v.literal('specific_units'), v.literal('managers'))
  ),
  isActive: v.optional(v.boolean()),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  search: v.optional(v.string()),
  createdBy: v.optional(v.id('users')),
} as const;

export const webGetNoticesCountReturns = v.object({
  count: v.number(),
});

type Args = {
  propertyId?: Id<'properties'>;
  unitId?: Id<'units'>;
  noticeType?: 'announcement' | 'maintenance' | 'payment_reminder' | 'emergency' | 'event' | 'general';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience?: 'all' | 'tenants' | 'specific_units' | 'managers';
  isActive?: boolean;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  createdBy?: Id<'users'>;
};

export const webGetNoticesCountHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Choose the best index anchor based on provided filters
  let base;
  if (args.propertyId && args.noticeType) {
    base = ctx.db
      .query('notices')
      .withIndex('by_property', q => q.eq('propertyId', args.propertyId!))
      .filter(q => q.eq(q.field('noticeType'), args.noticeType!));
  } else if (args.propertyId) {
    base = ctx.db.query('notices').withIndex('by_property', q => q.eq('propertyId', args.propertyId!));
  } else if (args.createdBy) {
    base = ctx.db.query('notices').withIndex('by_created_by', q => q.eq('createdBy', args.createdBy!));
  } else if (args.noticeType) {
    base = ctx.db
      .query('notices')
      .withIndex('by_type', q =>
        q.eq(
          'noticeType',
          args.noticeType as 'announcement' | 'maintenance' | 'payment_reminder' | 'emergency' | 'event'
        )
      );

  } else if (args.priority) {
    base = ctx.db.query('notices').withIndex('by_priority', q => q.eq('priority', args.priority!));
  } else if (args.isActive !== undefined) {
    base = ctx.db.query('notices').withIndex('by_active', q => q.eq('isActive', args.isActive!));
  } else {
    base = ctx.db.query('notices');
  }

  // Apply additional filters
  if (args.unitId) {
    base = base.filter(q => q.eq(q.field('unitId'), args.unitId!));
  }
  if (args.targetAudience) {
    base = base.filter(q => q.eq(q.field('targetAudience'), args.targetAudience!));
  }
  if (args.dateFrom) {
    base = base.filter(q => q.gte(q.field('createdAt'), args.dateFrom!));
  }
  if (args.dateTo) {
    base = base.filter(q => q.lte(q.field('createdAt'), args.dateTo!));
  }

  // Get all notices that match the filters
  const allNotices = await base.collect();

  // Apply search filter if provided (after collecting to support case-insensitive partial matching)
  let filteredNotices = allNotices;
  if (args.search) {
    const searchTerm = args.search.toLowerCase();
    filteredNotices = allNotices.filter(
      notice => notice.title.toLowerCase().includes(searchTerm) || notice.content.toLowerCase().includes(searchTerm)
    );
  }

  return {
    count: filteredNotices.length,
  };
};
