import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getNoticeAcknowledgmentsArgs = {
  paginationOpts: paginationOptsValidator,
  noticeId: v.id('notices'),
} as const;

export const getNoticeAcknowledgmentsReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('noticeAcknowledgments'),
      _creationTime: v.number(),
      noticeId: v.id('notices'),
      userId: v.id('users'),
      acknowledgedAt: v.number(),
      user: v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        profileImage: v.optional(v.string()),
      }),
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
});

type Args = {
  paginationOpts: PaginationOptions;
  noticeId: Id<'notices'>;
};

export const getNoticeAcknowledgmentsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Verify the notice exists and user has access to it
  const notice = await ctx.db.get(args.noticeId);
  if (!notice) throw new Error('Notice not found');

  // Get acknowledgments for the notice
  const results = await ctx.db
    .query('noticeAcknowledgments')
    .withIndex('by_notice', q => q.eq('noticeId', args.noticeId))
    .order('desc')
    .paginate(args.paginationOpts);

  // Enrich with user data
  const enrichedPage = await Promise.all(
    results.page.map(async ack => {
      const user = await ctx.db.get(ack.userId);
      if (!user) throw new Error('User not found');

      return {
        ...ack,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
        },
      };
    })
  );

  return {
    page: enrichedPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
