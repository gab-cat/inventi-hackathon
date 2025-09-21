import { v, Infer } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';

export const mobileSubmitPollResponseArgs = v.object({
  pollId: v.id('polls'),
  selectedOptions: v.array(v.number()), // Array of indices for selected options
  textResponse: v.optional(v.string()), // For text-based polls
});

export const mobileSubmitPollResponseReturns = v.union(
  v.object({
    _id: v.id('pollResponses'),
    _creationTime: v.number(),
    pollId: v.id('polls'),
    userId: v.optional(v.id('users')),
    selectedOptions: v.array(v.number()),
    textResponse: v.optional(v.string()),
    submittedAt: v.number(),
  }),
  v.null()
);

export const mobileSubmitPollResponseHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileSubmitPollResponseArgs>
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current tenant user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');
  if (currentUser.role !== 'tenant') throw new Error('Access denied: Tenants only');

  // Verify the poll exists and is active
  const poll = await ctx.db.get(args.pollId);
  if (!poll || !poll.isActive) return null;

  // Check if poll has expired
  if (poll.expiresAt && poll.expiresAt < Date.now()) {
    throw new Error('Poll has expired');
  }

  // Check if user has access to this poll (same property)
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user', q => q.eq('userId', currentUser._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  const hasAccess = userProperties.some(up => up.propertyId === poll.propertyId);
  if (!hasAccess) throw new Error('Access denied: Poll not available for this user');

  // Validate selected options
  if (args.selectedOptions.length === 0 && !args.textResponse) {
    throw new Error('Must provide either selected options or text response');
  }

  // Validate option indices are within bounds
  if (args.selectedOptions.length > 0) {
    const maxOptionIndex = poll.options.length - 1;
    const invalidOptions = args.selectedOptions.filter(index => index < 0 || index > maxOptionIndex);
    if (invalidOptions.length > 0) {
      throw new Error(`Invalid option indices: ${invalidOptions.join(', ')}`);
    }

    // For single choice polls, ensure only one option is selected
    if (poll.pollType === 'single_choice' && args.selectedOptions.length > 1) {
      throw new Error('Single choice polls can only have one selected option');
    }

    // For multiple choice polls, ensure at least one option is selected
    if (poll.pollType === 'multiple_choice' && args.selectedOptions.length === 0) {
      throw new Error('Multiple choice polls must have at least one selected option');
    }
  }

  // For rating polls, ensure exactly one option is selected
  if (poll.pollType === 'rating' && args.selectedOptions.length !== 1) {
    throw new Error('Rating polls must have exactly one selected option');
  }

  // For text polls, ensure text response is provided
  if (poll.pollType === 'text' && !args.textResponse) {
    throw new Error('Text polls must have a text response');
  }

  // Check if user has already responded to this poll
  const existingResponse = await ctx.db
    .query('pollResponses')
    .withIndex('by_poll_user', q => q.eq('pollId', args.pollId).eq('userId', currentUser._id))
    .unique();

  if (existingResponse) {
    // Update existing response
    await ctx.db.patch(existingResponse._id, {
      selectedOptions: args.selectedOptions,
      textResponse: args.textResponse,
      submittedAt: Date.now(),
    });

    // Return updated response
    const updatedResponse = await ctx.db.get(existingResponse._id);
    return updatedResponse || null;
  } else {
    // Create new response
    const responseId = await ctx.db.insert('pollResponses', {
      pollId: args.pollId,
      userId: poll.allowAnonymous ? undefined : currentUser._id,
      selectedOptions: args.selectedOptions,
      textResponse: args.textResponse,
      submittedAt: Date.now(),
    });

    // Return the created response
    const createdResponse = await ctx.db.get(responseId);
    if (!createdResponse) throw new Error('Failed to create poll response');

    return createdResponse;
  }
};
