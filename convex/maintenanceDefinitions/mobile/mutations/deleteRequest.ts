import { MutationCtx } from "../../../_generated/server";
import { Id } from "../../../_generated/dataModel";
import { v } from "convex/values";

export const deleteRequestArgs = v.object({
  requestId: v.id("maintenanceRequests"),
});

export const deleteRequestHandler = async (
  ctx: MutationCtx,
  args: { requestId: Id<"maintenanceRequests"> }
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

  await ctx.db.delete(args.requestId);

  return { success: true };
};


