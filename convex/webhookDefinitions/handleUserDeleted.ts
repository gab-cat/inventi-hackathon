import { v, Infer } from "convex/values";
import { MutationCtx } from "../_generated/server";

export const handleUserDeletedArgs = v.object({
  clerkId: v.string(),
});

export const handleUserDeletedHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof handleUserDeletedArgs>,
) => {
  const { clerkId } = args;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) return null;

  await ctx.db.delete(user._id);
  return user._id;
};

