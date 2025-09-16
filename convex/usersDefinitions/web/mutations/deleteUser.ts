import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const deleteUser = mutation({
  args: { userId: v.id('users') },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Ensure the document exists
    const existing = await ctx.db.get(args.userId);
    if (!existing) {
      throw new Error('User not found');
    }
    await ctx.db.delete(args.userId);
    return null;
  },
});
