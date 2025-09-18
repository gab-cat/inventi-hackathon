import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';

export const getUsersArgs = {
  paginationOpts: paginationOptsValidator,
  searchQuery: v.optional(v.string()),
} as const;

export const getUsersReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      clerkId: v.string(),
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      role: v.union(v.literal('manager'), v.literal('field_technician'), v.literal('tenant'), v.literal('vendor')),
      phone: v.optional(v.string()),
      profileImage: v.optional(v.string()),
      isActive: v.boolean(),
      lastLoginAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
  pageStatus: v.optional(v.union(v.string(), v.null())),
  splitCursor: v.optional(v.union(v.string(), v.null())),
});

type Args = {
  paginationOpts: PaginationOptions;
  searchQuery?: string;
};

export const getUsersHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager or field technician
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // For search functionality, we'll get all users and filter client-side
  if (args.searchQuery && args.searchQuery.trim()) {
    const searchTerm = args.searchQuery.trim().toLowerCase();

    // Get all users first
    const allUsers = await ctx.db.query('users').order('desc').collect();

    // Filter users client-side
    const filteredUsers = allUsers.filter(user => {
      const firstName = (user.firstName || '').toLowerCase();
      const lastName = (user.lastName || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();

      return (
        fullName.includes(searchTerm) ||
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm) ||
        email.includes(searchTerm)
      );
    });

    // Manually implement pagination on filtered results
    const startIndex = args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) : 0;
    const endIndex = startIndex + args.paginationOpts.numItems;
    const page = filteredUsers.slice(startIndex, endIndex);
    const isDone = endIndex >= filteredUsers.length;
    const continueCursor = isDone ? undefined : endIndex.toString();

    return {
      page,
      isDone,
      continueCursor,
    };
  } else {
    // No search query, use normal pagination
    return await ctx.db.query('users').order('desc').paginate(args.paginationOpts);
  }
};
