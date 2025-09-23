import { query } from '../../../_generated/server';
import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webGetChatThreadByIdArgs = {
  threadId: v.id('chatThreads'),
};

export const webGetChatThreadByIdReturns = v.union(
  v.null(),
  v.object({
    _id: v.id('chatThreads'),
    _creationTime: v.float64(),
    propertyId: v.id('properties'),
    threadType: v.string(),
    title: v.optional(v.string()),
    participants: v.array(v.id('users')),
    lastMessageAt: v.union(v.float64(), v.null()),
    isArchived: v.boolean(),
    assignedTo: v.union(v.id('users'), v.null()),
    priority: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
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
    assignedToDetails: v.union(
      v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        role: v.string(),
      }),
      v.null()
    ),
  })
);

export const webGetChatThreadByIdHandler = async (
  ctx: { auth: { getUserIdentity: () => Promise<any> }; db: any },
  args: { threadId: Id<'chatThreads'> }
) => {
  const { threadId } = args;

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

  // Get thread
  const thread = await ctx.db.get(threadId);
  if (!thread) {
    return null;
  }

  // Check if user is a participant
  if (!thread.participants.includes(user._id)) {
    throw new Error('Access denied');
  }

  // Get property details
  const property = await ctx.db.get(thread.propertyId);
  if (!property) {
    throw new Error('Property not found');
  }

  // Get participant details
  const participantDetails = await Promise.all(
    thread.participants.map(async (participantId: Id<'users'>) => {
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
    ? await ctx.db.get(thread.assignedTo).then((assigned: Doc<'users'> | null) =>
        assigned
          ? {
              _id: assigned._id,
              firstName: assigned.firstName,
              lastName: assigned.lastName,
              email: assigned.email,
              role: assigned.role,
            }
          : null
      )
    : null;

  return {
    _id: thread._id,
    _creationTime: thread._creationTime,
    propertyId: thread.propertyId,
    threadType: thread.threadType,
    title: thread.title || undefined,
    participants: thread.participants,
    lastMessageAt: thread.lastMessageAt || null,
    isArchived: thread.isArchived,
    assignedTo: thread.assignedTo || null,
    priority: thread.priority || undefined,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    property: {
      _id: property._id,
      name: property.name,
    },
    participantDetails: participantDetails.filter(Boolean),
    assignedToDetails,
  };
};

export type GetChatThreadByIdArgs = typeof webGetChatThreadByIdArgs;
export type GetChatThreadByIdReturns = typeof webGetChatThreadByIdReturns;
export type GetChatThreadByIdHandler = typeof webGetChatThreadByIdHandler;
