import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webCheckInVisitorArgs = {
  visitorRequestId: v.id('visitorRequests'),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),
} as const;

export const webCheckInVisitorReturns = v.object({
  success: v.boolean(),
  visitorLogId: v.id('visitorLogs'),
});

type Args = {
  visitorRequestId: Id<'visitorRequests'>;
  location?: string;
  notes?: string;
};

export const webCheckInVisitorHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'manager') {
    throw new Error('Only managers can check in visitors');
  }

  const visitorRequest = await ctx.db.get(args.visitorRequestId);
  if (!visitorRequest) {
    throw new Error('Visitor request not found');
  }

  if (visitorRequest.status !== 'approved') {
    throw new Error('Visitor request must be approved to check in');
  }

  // Create visitor log entry
  const visitorLogId = await ctx.db.insert('visitorLogs', {
    visitorRequestId: args.visitorRequestId,
    propertyId: visitorRequest.propertyId,
    unitId: visitorRequest.unitId,
    visitorName: visitorRequest.visitorName,
    action: 'check_in',
    timestamp: Date.now(),
    location: args.location,
    verifiedBy: user._id,
    notes: args.notes,
    blockchainTxHash: `temp_${Date.now()}`, // Placeholder for blockchain integration
    createdAt: Date.now(),
  });

  return { success: true, visitorLogId };
};
