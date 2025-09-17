import { MutationCtx } from "../../../_generated/server";
import { Id } from "../../../_generated/dataModel";
import { v } from "convex/values";

export const cancelRequestArgs = v.object({
  requestId: v.id("maintenanceRequests"),
  reason: v.optional(v.string()),
});

export const cancelRequestHandler = async (
  ctx: MutationCtx,
  args: { requestId: Id<"maintenanceRequests">; reason?: string }
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return { success: false, message: "User not authenticated" };

  const request = await ctx.db.get(args.requestId);
  if (!request) return { success: false, message: "Request not found" };

  const me = identity._id as Id<"users">;
  const isRequester = request.requestedBy === me;

  const rel = await ctx.db
    .query("userProperties")
    .withIndex("by_user_property", (q) => q.eq("userId", me).eq("propertyId", request.propertyId))
    .first();
  const isManager = !!rel && rel.role === "manager";

  if (!(isRequester || isManager)) {
    return { success: false, message: "Not authorized" };
  }

  await ctx.db.patch(args.requestId, { status: "cancelled", updatedAt: Date.now() });

  await ctx.db.insert("maintenanceUpdates", {
    requestId: args.requestId,
    propertyId: request.propertyId,
    status: "cancelled",
    description: args.reason ?? "Request cancelled",
    updatedBy: me,
    timestamp: Date.now(),
  });

  return { success: true };
};


