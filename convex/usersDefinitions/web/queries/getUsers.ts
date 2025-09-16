import { query } from '../../../_generated/server';
import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

export const getUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    role: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id('users'),
        _creationTime: v.number(),
        clerkId: v.string(),
        walletAddress: v.string(),
        email: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        phone: v.optional(v.string()),
        profileImage: v.optional(v.string()),
        roles: v.array(v.string()),
        isActive: v.boolean(),
        lastLoginAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    // Use indexes when filters are provided; otherwise, scan with pagination.
    if (args.role) {
      return await ctx.db
        .query('users')
        .withIndex('by_roles', q => q.eq('roles', args.role!))
        .order('desc')
        .paginate(args.paginationOpts);
    }
    if (args.isActive !== undefined) {
      return await ctx.db
        .query('users')
        .withIndex('by_active', q => q.eq('isActive', args.isActive!))
        .order('desc')
        .paginate(args.paginationOpts);
    }

    return await ctx.db.query('users').order('desc').paginate(args.paginationOpts);
  },
});
