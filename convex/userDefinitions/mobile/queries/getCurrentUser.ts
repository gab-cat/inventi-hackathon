
import { QueryCtx } from "../../../_generated/server";

export const getCurrentUserArgs = {};

export const getCurrentUserHandler = async (
  ctx: QueryCtx,
) => {
  const userId = await ctx.auth.getUserIdentity();
  if (!userId) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  const user = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), userId.subject)).first();
  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  return {
    success: true,
    user,
  };
};