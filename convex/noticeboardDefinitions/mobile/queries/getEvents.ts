import { v, ConvexError, Infer } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Doc } from '../../../_generated/dataModel';

export const mobileGetEventsArgs = v.object({
  paginationOpts: paginationOptsValidator,
  eventType: v.optional(
    v.union(
      v.literal('community'),
      v.literal('maintenance'),
      v.literal('meeting'),
      v.literal('social'),
      v.literal('emergency')
    )
  ),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  isPublic: v.optional(v.boolean()),
  search: v.optional(v.string()),
});

export const mobileGetEventsReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('events'),
      _creationTime: v.number(),
      propertyId: v.id('properties'),
      createdBy: v.id('users'),
      title: v.string(),
      description: v.string(),
      eventType: v.string(),
      startDate: v.number(),
      endDate: v.number(),
      location: v.optional(v.string()),
      isRecurring: v.boolean(),
      recurringPattern: v.optional(v.string()),
      maxAttendees: v.optional(v.number()),
      isPublic: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
      // Mobile-specific fields
      isAttending: v.union(v.literal('attending'), v.literal('maybe'), v.literal('declined'), v.null()),
      attendeeCount: v.number(),
      isFull: v.boolean(),
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

export const mobileGetEventsHandler = async (ctx: QueryCtx, args: Infer<typeof mobileGetEventsArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current tenant user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');

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

  // Build query for events relevant to this user
  let baseQuery = ctx.db.query('events');

  // Filter by user's properties
  baseQuery = baseQuery.filter(q => q.or(...propertyIds.map(propertyId => q.eq(q.field('propertyId'), propertyId))));

  // Apply additional filters
  if (args.eventType) {
    baseQuery = baseQuery.filter(q => q.eq(q.field('eventType'), args.eventType!));
  }
  if (args.isPublic !== undefined) {
    baseQuery = baseQuery.filter(q => q.eq(q.field('isPublic'), args.isPublic!));
  }
  if (args.startDate) {
    baseQuery = baseQuery.filter(q => q.gte(q.field('startDate'), args.startDate!));
  }
  if (args.endDate) {
    baseQuery = baseQuery.filter(q => q.lte(q.field('endDate'), args.endDate!));
  }

  // Order by start date (upcoming first)
  let results;
  try {
    results = await baseQuery.order('asc').paginate(args.paginationOpts);
  } catch (error) {
    // If cursor is invalid (from a different query/session), start from beginning
    if (error instanceof ConvexError && error.data?.code === 'InvalidCursor') {
      console.warn('Invalid cursor detected during hot reload, starting from beginning');
      results = await baseQuery.order('asc').paginate({
        numItems: args.paginationOpts.numItems,
        cursor: null,
      });
    } else {
      throw error;
    }
  }

  // Enrich with related data and attendance status
  const enrichedPage = await Promise.all(
    results.page.map(async (event: Doc<'events'>) => {
      // Get property info
      const property = await ctx.db.get(event.propertyId);
      if (!property) throw new Error('Property not found');

      // Get creator info
      const creator = await ctx.db.get(event.createdBy);
      if (!creator) throw new Error('Creator not found');

      // Check if user is attending this event
      const userAttendance = await ctx.db
        .query('eventAttendees')
        .withIndex('by_event_user', q => q.eq('eventId', event._id).eq('userId', currentUser._id))
        .unique();

      const isAttending = (userAttendance?.status as 'attending' | 'maybe' | 'declined' | null) || null;

      // Get attendee count
      const allAttendees = await ctx.db
        .query('eventAttendees')
        .withIndex('by_event', q => q.eq('eventId', event._id))
        .collect();
      const attendeeCount = allAttendees.length;

      // Check if event is full
      const isFull = event.maxAttendees ? attendeeCount >= event.maxAttendees : false;

      return {
        ...event,
        isAttending,
        attendeeCount,
        isFull,
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

  // Apply search filter if provided
  let filteredPage = enrichedPage;
  if (args.search) {
    const searchTerm = args.search.toLowerCase();
    filteredPage = enrichedPage.filter(
      event => event.title.toLowerCase().includes(searchTerm) || event.description.toLowerCase().includes(searchTerm)
    );
  }

  return {
    page: filteredPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
