import { QueryCtx } from "../../../_generated/server";

export const getMyCurrentRequestsArgs = {};

export const getMyCurrentRequestsHandler = async (
  ctx: QueryCtx,
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: "User not authenticated" };
  }

  const me = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), identity.subject)).first();
  if (!me) {
    return { success: false, message: "User not found" };
  }

  const mine = await ctx.db
    .query("maintenanceRequests")
    .withIndex("by_requested_by", (q) => q.eq("requestedBy", me._id))
    .collect();

  const active = mine.filter((r) => r.status !== "completed" && r.status !== "cancelled" && r.status !== "rejected");

  return { success: true, requests: active };
};


