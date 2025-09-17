import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const mobileAddEventToCalendarArgs = {
  eventId: v.id('events'),
  status: v.union(v.literal('attending'), v.literal('maybe'), v.literal('declined')),
} as const;

export const mobileAddEventToCalendarReturns = v.union(
  v.object({
    _id: v.id('eventAttendees'),
    _creationTime: v.number(),
    eventId: v.id('events'),
    userId: v.id('users'),
    status: v.string(),
    registeredAt: v.number(),
  }),
  v.null()
);

type Args = {
  eventId: Id<'events'>;
  status: 'attending' | 'maybe' | 'declined';
};

export const mobileAddEventToCalendarHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current tenant user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');
  if (currentUser.role !== 'tenant') throw new Error('Access denied: Tenants only');

  // Verify the event exists and user has access
  const event = await ctx.db.get(args.eventId);
  if (!event) return null;

  // Check if user has access to this event (same property)
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user', q => q.eq('userId', currentUser._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  const hasAccess = userProperties.some(up => up.propertyId === event.propertyId);
  if (!hasAccess) throw new Error('Access denied: Event not available for this user');

  // Check if event is in the past
  if (event.endDate < Date.now()) {
    throw new Error('Cannot RSVP to past events');
  }

  // Check if event has capacity and is full (only for attending status)
  if (args.status === 'attending' && event.maxAttendees) {
    const currentAttendees = await ctx.db
      .query('eventAttendees')
      .withIndex('by_event', q => q.eq('eventId', args.eventId))
      .filter(q => q.eq(q.field('status'), 'attending'))
      .collect();

    if (currentAttendees.length >= event.maxAttendees) {
      throw new Error('Event is at full capacity');
    }
  }

  // Check if user has already RSVP'd to this event
  const existingRSVP = await ctx.db
    .query('eventAttendees')
    .withIndex('by_event_user', q => q.eq('eventId', args.eventId).eq('userId', currentUser._id))
    .unique();

  if (existingRSVP) {
    // Update existing RSVP
    await ctx.db.patch(existingRSVP._id, {
      status: args.status,
      registeredAt: Date.now(),
    });

    // Return updated RSVP
    const updatedRSVP = await ctx.db.get(existingRSVP._id);
    return updatedRSVP || null;
  } else {
    // Create new RSVP
    const rsvpId = await ctx.db.insert('eventAttendees', {
      eventId: args.eventId,
      userId: currentUser._id,
      status: args.status,
      registeredAt: Date.now(),
    });

    // Return the created RSVP
    const createdRSVP = await ctx.db.get(rsvpId);
    if (!createdRSVP) throw new Error('Failed to create RSVP');

    return createdRSVP;
  }
};
