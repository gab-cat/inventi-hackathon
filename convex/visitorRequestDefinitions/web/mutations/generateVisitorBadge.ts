import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGenerateVisitorBadgeArgs = {
  visitorRequestId: v.id('visitorRequests'),
} as const;

export const webGenerateVisitorBadgeReturns = v.object({
  badgeId: v.string(),
  visitorName: v.string(),
  propertyId: v.id('properties'),
  unitId: v.id('units'),
  validFrom: v.number(),
  validUntil: v.number(),
  qrCode: v.string(),
});

type Args = {
  visitorRequestId: Id<'visitorRequests'>;
};

export const webGenerateVisitorBadgeHandler = async (ctx: MutationCtx, args: Args) => {
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
    throw new Error('Only managers can generate visitor badges');
  }

  const visitorRequest = await ctx.db.get(args.visitorRequestId);
  if (!visitorRequest) {
    throw new Error('Visitor request not found');
  }

  if (visitorRequest.status !== 'approved') {
    throw new Error('Visitor request must be approved to generate badge');
  }

  // Generate a unique badge ID
  const badgeId = `VB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // In a real implementation, this would generate a QR code or physical badge
  // For now, we'll just return the badge information
  return {
    badgeId,
    visitorName: visitorRequest.visitorName,
    propertyId: visitorRequest.propertyId,
    unitId: visitorRequest.unitId,
    validFrom: visitorRequest.expectedArrival,
    validUntil: visitorRequest.expectedDeparture || visitorRequest.expectedArrival + 24 * 60 * 60 * 1000, // 24 hours default
    qrCode: `visitor:${badgeId}:${visitorRequest._id}`,
  };
};
