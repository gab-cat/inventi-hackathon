import { v, ConvexError, Infer } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Doc } from '../../../_generated/dataModel';

export const mobileGetNoticesArgs = v.object({
  paginationOpts: paginationOptsValidator,
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
  isRead: v.optional(v.boolean()), // Filter by read/unread status
  search: v.optional(v.string()),
});

export const mobileGetNoticesReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('notices'),
      _creationTime: v.number(),
      propertyId: v.id('properties'),
      unitId: v.optional(v.id('units')),
      createdBy: v.id('users'),
      title: v.string(),
      content: v.string(),
      noticeType: v.string(),
      priority: v.string(),
      targetAudience: v.string(),
      isActive: v.boolean(),
      scheduledAt: v.optional(v.number()),
      expiresAt: v.optional(v.number()),
      attachments: v.optional(v.array(v.string())),
      createdAt: v.number(),
      updatedAt: v.number(),
      // Mobile-specific fields
      isRead: v.boolean(),
      acknowledgedAt: v.optional(v.number()),
      // Joined data
      property: v.object({
        _id: v.id('properties'),
        name: v.string(),
        address: v.string(),
      }),
      creator: v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
      }),
      unit: v.optional(
        v.object({
          _id: v.id('units'),
          unitNumber: v.string(),
        })
      ),
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
});

export const mobileGetNoticesHandler = async (ctx: QueryCtx, args: Infer<typeof mobileGetNoticesArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current tenant user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');

  // Get user's properties and units
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user', q => q.eq('userId', currentUser._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  if (userProperties.length === 0) {
    return {
      page: [],
      isDone: true,
      continueCursor: undefined,
    };
  }

  const propertyIds = userProperties.map(up => up.propertyId);

  // Get user's units for tenant-specific notices
  const userUnits = await ctx.db
    .query('units')
    .filter(q => q.and(q.eq(q.field('tenantId'), currentUser._id), q.eq(q.field('isOccupied'), true)))
    .collect();
  const userUnitIds = userUnits.map(unit => unit._id);

  // Build query for notices relevant to this user
  let baseQuery = ctx.db.query('notices');

  // Filter by user's properties
  baseQuery = baseQuery.filter(q => q.or(...propertyIds.map(propertyId => q.eq(q.field('propertyId'), propertyId))));

  // Apply additional filters
  if (args.noticeType) {
    baseQuery = baseQuery.filter(q => q.eq(q.field('noticeType'), args.noticeType!));
  }
  if (args.priority) {
    baseQuery = baseQuery.filter(q => q.eq(q.field('priority'), args.priority!));
  }

  // Only show active notices
  baseQuery = baseQuery.filter(q => q.eq(q.field('isActive'), true));

  // Filter by target audience relevant to tenant
  baseQuery = baseQuery.filter(q =>
    q.or(
      q.eq(q.field('targetAudience'), 'all'),
      q.eq(q.field('targetAudience'), 'tenants'),
      q.and(
        q.eq(q.field('targetAudience'), 'specific_units'),
        q.or(...userUnitIds.map(unitId => q.eq(q.field('unitId'), unitId)))
      )
    )
  );

  // Order by creation time (newest first) and priority
  let results;
  try {
    results = await baseQuery.order('desc').paginate(args.paginationOpts);
  } catch (error) {
    // If cursor is invalid (from a different query/session), start from beginning
    if (error instanceof ConvexError && error.data?.code === 'InvalidCursor') {
      console.warn('Invalid cursor detected during hot reload, starting from beginning');
      results = await baseQuery.order('desc').paginate({
        numItems: args.paginationOpts.numItems,
        cursor: null,
      });
    } else {
      throw error;
    }
  }

  // Enrich with related data and read status
  const enrichedPage = await Promise.all(
    results.page.map(async (notice: Doc<'notices'>) => {
      // Get property info
      const property = await ctx.db.get(notice.propertyId);
      if (!property) throw new Error('Property not found');

      // Get creator info
      const creator = await ctx.db.get(notice.createdBy);
      if (!creator) throw new Error('Creator not found');

      // Get unit info if applicable
      let unit = undefined;
      if (notice.unitId) {
        const unitData = await ctx.db.get(notice.unitId);
        if (unitData) {
          unit = {
            _id: unitData._id,
            unitNumber: unitData.unitNumber,
          };
        }
      }

      // Check if user has acknowledged this notice
      const acknowledgment = await ctx.db
        .query('noticeAcknowledgments')
        .withIndex('by_notice_user', q => q.eq('noticeId', notice._id).eq('userId', currentUser._id))
        .unique();

      const isRead = !!acknowledgment;
      const acknowledgedAt = acknowledgment?.acknowledgedAt;

      return {
        ...notice,
        isRead,
        acknowledgedAt,
        property: {
          _id: property._id,
          name: property.name,
          address: property.address,
        },
        creator: {
          _id: creator._id,
          firstName: creator.firstName,
          lastName: creator.lastName,
        },
        unit,
      };
    })
  );

  // Apply read status filter
  let filteredPage = enrichedPage;
  if (args.isRead !== undefined) {
    filteredPage = enrichedPage.filter(notice => notice.isRead === args.isRead);
  }

  // Apply search filter if provided
  if (args.search) {
    const searchTerm = args.search.toLowerCase();
    filteredPage = filteredPage.filter(
      notice => notice.title.toLowerCase().includes(searchTerm) || notice.content.toLowerCase().includes(searchTerm)
    );
  }

  return {
    page: filteredPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
