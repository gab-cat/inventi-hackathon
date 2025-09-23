import { query } from '../../../_generated/server';
import { v } from 'convex/values';

export const webGetAllChatThreadsArgs = {
  propertyId: v.id('properties'),
  threadType: v.optional(v.string()),
  isArchived: v.optional(v.boolean()),
  limit: v.optional(v.number()),
};

export const webGetAllChatThreadsReturns = v.array(
  v.object({
    _id: v.id('chatThreads'),
    _creationTime: v.number(),
    propertyId: v.id('properties'),
    threadType: v.string(),
    title: v.optional(v.string()),
    participants: v.array(v.id('users')),
    lastMessageAt: v.optional(v.number()),
    isArchived: v.boolean(),
    assignedTo: v.optional(v.id('users')),
    priority: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Joined data
    property: v.object({
      _id: v.id('properties'),
      name: v.string(),
    }),
    participantDetails: v.array(
      v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        role: v.string(),
        profileImage: v.optional(v.string()),
      })
    ),
    assignedToDetails: v.optional(
      v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        role: v.string(),
      })
    ),
    unreadCount: v.number(),
  })
);

export const webGetAllChatThreadsHandler = async (ctx: any, args: any) => {
  const { propertyId, threadType, isArchived, limit = 50 } = args;

  // Get current user
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has access to this property
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', (q: any) => q.eq('userId', user._id).eq('propertyId', propertyId))
    .first();

  if (!userProperty && user.role !== 'manager') {
    throw new Error('Access denied');
  }

  // Build query
  let query = ctx.db.query('chatThreads').withIndex('by_property', (q: any) => q.eq('propertyId', propertyId));

  if (threadType) {
    query = query.filter((q: any) => q.eq(q.field('threadType'), threadType));
  }

  if (isArchived !== undefined) {
    query = query.filter((q: any) => q.eq(q.field('isArchived'), isArchived));
  }

  // Only show threads where user is a participant

  const allThreads = await query.order('desc').take(limit);

  // Filter threads where user is a participant
  const threads = allThreads.filter((thread: any) => thread.participants.includes(user._id));

  // Get property details
  const property = await ctx.db.get(propertyId);
  if (!property) {
    throw new Error('Property not found');
  }

  // Get participant details and unread counts
  const threadsWithDetails = await Promise.all(
    threads.map(async (thread: any) => {
      const participantDetails = await Promise.all(
        thread.participants.map(async (participantId: any) => {
          const participant = await ctx.db.get(participantId);
          return participant
            ? {
                _id: participant._id,
                firstName: participant.firstName,
                lastName: participant.lastName,
                email: participant.email,
                role: participant.role,
                profileImage: participant.profileImage,
              }
            : null;
        })
      );

      const assignedToDetails = thread.assignedTo
        ? await ctx.db.get(thread.assignedTo).then((assigned: any) =>
            assigned
              ? {
                  _id: assigned._id,
                  firstName: assigned.firstName,
                  lastName: assigned.lastName,
                  email: assigned.email,
                  role: assigned.role,
                }
              : undefined
          )
        : undefined;

      // Get unread message count
      const unreadMessages = await ctx.db
        .query('messages')
        .withIndex('by_thread', (q: any) => q.eq('threadId', thread._id))
        .filter((q: any) => q.and(q.eq(q.field('isRead'), false), q.neq(q.field('senderId'), user._id)))
        .collect();

      return {
        ...thread,
        property: {
          _id: property._id,
          name: property.name,
        },
        participantDetails: participantDetails.filter(Boolean),
        assignedToDetails,
        unreadCount: unreadMessages.length,
      };
    })
  );

  return threadsWithDetails;
};

export type GetAllChatThreadsArgs = typeof webGetAllChatThreadsArgs;
export type GetAllChatThreadsReturns = typeof webGetAllChatThreadsReturns;
export type GetAllChatThreadsHandler = typeof webGetAllChatThreadsHandler;
