import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    data: v.object({
      walletAddress: v.optional(v.string()),
      email: v.optional(v.string()),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      phone: v.optional(v.string()),
      profileImage: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      isActive: v.optional(v.boolean()),
      lastLoginAt: v.optional(v.number()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Ensure the document exists
    const existing = await ctx.db.get(args.userId);
    if (!existing) {
      throw new Error('User not found');
    }

    await ctx.db.patch(args.userId, {
      ...args.data,
      updatedAt: Date.now(),
    });
    return null;
  },
});
