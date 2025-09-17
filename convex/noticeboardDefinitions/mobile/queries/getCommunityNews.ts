import { v, ConvexError } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';

export const mobileGetCommunityNewsArgs = {
  paginationOpts: paginationOptsValidator,
  search: v.optional(v.string()),
} as const;

export const mobileGetCommunityNewsReturns = v.object({
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

type Args = {
  paginationOpts: PaginationOptions;
  search?: string;
};

export const mobileGetCommunityNewsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current tenant user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');
  if (currentUser.role !== 'tenant') throw new Error('Access denied: Tenants only');

  // Get user's properties
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

  // Build query for community news relevant to this user
  // Community news includes: announcements, community events, general notices, emergency notices
  let baseQuery = ctx.db.query('notices');

  // Filter by user's properties
  baseQuery = baseQuery.filter(q => q.or(...propertyIds.map(propertyId => q.eq(q.field('propertyId'), propertyId))));

  // Filter for community-focused notice types
  baseQuery = baseQuery.filter(q =>
    q.or(
      q.eq(q.field('noticeType'), 'announcement'),
      q.eq(q.field('noticeType'), 'event'),
      q.eq(q.field('noticeType'), 'general'),
      q.eq(q.field('noticeType'), 'emergency')
    )
  );

  // Only show active notices
  baseQuery = baseQuery.filter(q => q.eq(q.field('isActive'), true));

  // Filter by community-relevant target audiences
  baseQuery = baseQuery.filter(q =>
    q.or(q.eq(q.field('targetAudience'), 'all'), q.eq(q.field('targetAudience'), 'tenants'))
  );

  // Order by priority (urgent/high first) then by creation time (newest first)
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

      return {
        ...notice,
        isRead,
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

  // Apply search filter if provided
  let filteredPage = enrichedPage;
  if (args.search) {
    const searchTerm = args.search.toLowerCase();
    filteredPage = enrichedPage.filter(
      notice => notice.title.toLowerCase().includes(searchTerm) || notice.content.toLowerCase().includes(searchTerm)
    );
  }

  return {
    page: filteredPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
