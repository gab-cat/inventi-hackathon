import { v, Infer } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';

export const mobileAcknowledgeNoticeArgs = v.object({
  noticeId: v.id('notices'),
});

export const mobileAcknowledgeNoticeReturns = v.union(
  v.object({
    _id: v.id('noticeAcknowledgments'),
    _creationTime: v.number(),
    noticeId: v.id('notices'),
    userId: v.id('users'),
    acknowledgedAt: v.number(),
  }),
  v.null()
);

export const mobileAcknowledgeNoticeHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileAcknowledgeNoticeArgs>
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

  // Verify the notice exists and user has access
  const notice = await ctx.db.get(args.noticeId);
  if (!notice || !notice.isActive) return null;

  // Check if user has access to this notice (same property/units)
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user', q => q.eq('userId', currentUser._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  const hasAccess = userProperties.some(up => up.propertyId === notice.propertyId);
  if (!hasAccess) throw new Error('Access denied: Notice not available for this user');

  // Check if this notice is targeted at the user
  let canAccess = false;
  if (notice.targetAudience === 'all') {
    canAccess = true;
  } else if (notice.targetAudience === 'tenants') {
    canAccess = true;
  } else if (notice.targetAudience === 'specific_units') {
    if (notice.targetUnits && notice.targetUnits.length > 0) {
      // Check if user is tenant of any of the target units
      const userUnits = await ctx.db
        .query('units')
        .filter(q => q.and(q.eq(q.field('tenantId'), currentUser._id), q.eq(q.field('isOccupied'), true)))
        .collect();
      const userUnitIds = userUnits.map(unit => unit._id);
      canAccess = notice.targetUnits.some(unitId => userUnitIds.includes(unitId));
    }
  }

  if (!canAccess) throw new Error('Access denied: Notice not targeted at this user');

  // Check if user has already acknowledged this notice
  const existingAck = await ctx.db
    .query('noticeAcknowledgments')
    .withIndex('by_notice_user', q => q.eq('noticeId', args.noticeId).eq('userId', currentUser._id))
    .unique();

  if (existingAck) {
    // Return existing acknowledgment
    return existingAck;
  }

  // Create new acknowledgment
  const acknowledgmentId = await ctx.db.insert('noticeAcknowledgments', {
    noticeId: args.noticeId,
    userId: currentUser._id,
    acknowledgedAt: Date.now(),
  });

  // Return the created acknowledgment
  const createdAck = await ctx.db.get(acknowledgmentId);
  if (!createdAck) throw new Error('Failed to create acknowledgment');

  return createdAck;
};
