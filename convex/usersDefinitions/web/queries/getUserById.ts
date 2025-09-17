import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getUserByIdArgs = {
  id: v.id('users'),
};

export const getUserByIdHandler = async (ctx: QueryCtx, args: { id: Id<'users'> }) => {
  const { id } = args;

  const user = await ctx.db
    .query('users')
    .withIndex('by_id', q => q.eq('_id', id))
    .unique();

  return user;
};
