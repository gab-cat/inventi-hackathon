import { v, Infer } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Doc } from '../../../_generated/dataModel';

export const mobileGetActivePollsArgs = v.object({
  paginationOpts: paginationOptsValidator,
  search: v.optional(v.string()),
});

export const mobileGetActivePollsReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('polls'),
      _creationTime: v.number(),
      propertyId: v.id('properties'),
      createdBy: v.id('users'),
      title: v.string(),
      description: v.string(),
      question: v.string(),
      options: v.array(v.string()),
      pollType: v.string(),
      isActive: v.boolean(),
      allowAnonymous: v.boolean(),
      expiresAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
      // Mobile-specific fields
      hasResponded: v.boolean(),
      responseCount: v.number(),
      isExpired: v.boolean(),
      timeRemaining: v.optional(v.number()), // milliseconds until expiry
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
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
});

export const mobileGetActivePollsHandler = async (ctx: QueryCtx, args: Infer<typeof mobileGetActivePollsArgs>) => {
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

  // Capture current timestamp; do NOT use it inside the Convex query to keep cursor identity stable
  const now = Date.now();

  // Helper function to build the base query
  const buildBaseQuery = () => {
    let query = ctx.db.query('polls');

    // Filter by user's properties - use a safer approach
    if (propertyIds.length > 0) {
      query = query.filter(q => {
        const conditions = propertyIds.map(propertyId => q.eq(q.field('propertyId'), propertyId));
        return q.or(...conditions);
      });
    }

    // Only show active polls
    query = query.filter(q => q.eq(q.field('isActive'), true));

    return query;
  };

  // Order by creation time (newest first) and paginate
  let results;
  try {
    const baseQuery = buildBaseQuery();
    results = await baseQuery.order('desc').paginate(args.paginationOpts);
  } catch (error) {
    // If cursor is invalid (from a different query/session), start from beginning
    const message = (error as Error)?.message ?? '';
    if (message.includes('InvalidCursor')) {
      console.warn('Invalid cursor detected during hot reload, starting from beginning');
      const freshQuery = buildBaseQuery();
      results = await freshQuery.order('desc').paginate({
        numItems: args.paginationOpts.numItems,
        cursor: null,
      });
    } else {
      throw error;
    }
  }

  // Enrich with related data and response status
  const enrichedPage = await Promise.all(
    results.page.map(async (poll: Doc<'polls'>) => {
      // Get property info
      const property = await ctx.db.get(poll.propertyId);
      if (!property) throw new Error('Property not found');

      // Get creator info
      const creator = await ctx.db.get(poll.createdBy);
      if (!creator) throw new Error('Creator not found');

      // Check if user has responded to this poll
      const userResponse = await ctx.db
        .query('pollResponses')
        .withIndex('by_poll_user', q => q.eq('pollId', poll._id).eq('userId', currentUser._id))
        .unique();

      const hasResponded = !!userResponse;

      // Get response count
      const allResponses = await ctx.db
        .query('pollResponses')
        .withIndex('by_poll', q => q.eq('pollId', poll._id))
        .collect();
      const responseCount = allResponses.length;

      // Check if poll is expired
      const isExpired = poll.expiresAt ? poll.expiresAt < now : false;

      // Calculate time remaining
      const timeRemaining = poll.expiresAt && !isExpired ? poll.expiresAt - now : undefined;

      return {
        ...poll,
        hasResponded,
        responseCount,
        isExpired,
        timeRemaining,
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
      };
    })
  );

  // Apply post-query filters after enrichment to avoid cursor identity changes
  // 1) Filter out expired polls
  let filteredPage = enrichedPage.filter(poll => !poll.isExpired);
  // 2) Apply search filter if provided
  if (args.search) {
    const searchTerm = args.search.toLowerCase();
    filteredPage = enrichedPage.filter(
      poll =>
        poll.title.toLowerCase().includes(searchTerm) ||
        poll.description.toLowerCase().includes(searchTerm) ||
        poll.question.toLowerCase().includes(searchTerm)
    );
  }

  return {
    page: filteredPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
