import { query } from '../../../_generated/server';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';

export const getUsersPaginatedArgs = {
  paginationOpts: paginationOptsValidator,
  searchQuery: v.optional(v.string()),
} as const;

export const getUsersPaginatedHandler = async (
  ctx: QueryCtx,
  args: {
    paginationOpts: PaginationOptions;
    searchQuery?: string;
  }
) => {
  console.log('getUsersPaginated called with:', {
    searchQuery: args.searchQuery,
    numItems: args.paginationOpts.numItems,
    cursor: args.paginationOpts.cursor,
  });

  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError('Unauthorized');
  }

  // Check if the user is an admin
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();

  if (!currentUser || currentUser.role !== 'manager') {
    throw new ConvexError('Forbidden');
  }

  // For search functionality, we'll get all users and filter client-side
  if (args.searchQuery && args.searchQuery.trim()) {
    const searchTerm = args.searchQuery.trim().toLowerCase();
    console.log('Applying search filter:', searchTerm);

    // Get all users first
    const allUsers = await ctx.db.query('users').order('desc').collect();
    console.log('Total users fetched:', allUsers.length);

    // Filter users client-side
    const filteredUsers = allUsers.filter(user => {
      const firstName = (user.firstName || '').toLowerCase();
      const lastName = (user.lastName || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();

      const matches =
        fullName.includes(searchTerm) ||
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm) ||
        email.includes(searchTerm);

      if (matches) {
        console.log('Found matching user:', { firstName, lastName, email });
      }

      return matches;
    });

    console.log('Filtered users count:', filteredUsers.length);

    // Manually implement pagination on filtered results
    const startIndex = args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) : 0;
    const endIndex = startIndex + args.paginationOpts.numItems;
    const page = filteredUsers.slice(startIndex, endIndex);
    const isDone = endIndex >= filteredUsers.length;
    const continueCursor = isDone ? null : endIndex.toString();

    const result = {
      page,
      isDone,
      continueCursor,
    };

    console.log('Search result:', {
      searchQuery: args.searchQuery,
      pageCount: result.page.length,
      isDone: result.isDone,
      hasContinueCursor: !!result.continueCursor,
      totalFiltered: filteredUsers.length,
    });

    return result;
  } else {
    // No search query, use normal pagination
    const result = await ctx.db.query('users').order('desc').paginate(args.paginationOpts);

    console.log('No search - normal pagination result:', {
      pageCount: result.page.length,
      isDone: result.isDone,
      hasContinueCursor: !!result.continueCursor,
    });

    return result;
  }
};
