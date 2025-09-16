import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const createUser = mutation({
  args: {
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
  },
  returns: v.id('users'),
  handler: async (ctx, args) => {
    // Deduplicate by clerkId or email if present.
    const existingByClerk = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', args.clerkId))
      .unique();
    if (existingByClerk) {
      throw new Error('User with this clerkId already exists');
    }
    const existingByEmail = await ctx.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', args.email))
      .unique();
    if (existingByEmail) {
      throw new Error('User with this email already exists');
    }

    const now = Date.now();
    const userId = await ctx.db.insert('users', {
      clerkId: args.clerkId,
      walletAddress: args.walletAddress,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      profileImage: args.profileImage,
      roles: args.roles,
      isActive: args.isActive,
      lastLoginAt: args.lastLoginAt,
      createdAt: now,
      updatedAt: now,
    });
    return userId;
  },
});
