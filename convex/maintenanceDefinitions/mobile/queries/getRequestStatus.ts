import { QueryCtx } from "../../../_generated/server";
import { Id } from "../../../_generated/dataModel";
import { v } from "convex/values";

export const getRequestStatusArgs = v.object({
  requestId: v.id("maintenanceRequests"),
});

export const getRequestStatusHandler = async (
  ctx: QueryCtx,
  args: { requestId: Id<"maintenanceRequests"> }
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: "User not authenticated" };
  }

  const request = await ctx.db.get(args.requestId);
  if (!request) {
    return { success: false, message: "Request not found" };
  }

  // Authorization: requester or assigned or property manager
  const isRequester = request.requestedBy === (identity._id as Id<"users">);
  const isAssignee = request.assignedTo === (identity._id as Id<"users">);

  let isManager = false;
  if (!isRequester && !isAssignee) {
    const rel = await ctx.db
      .query("userProperties")
      .withIndex("by_user_property", (q) =>
        q.eq("userId", identity._id as Id<"users">).eq("propertyId", request.propertyId)
      )
      .first();
    isManager = !!rel && rel.role === "manager";
  }

  if (!(isRequester || isAssignee || isManager)) {
    return { success: false, message: "Not authorized" };
  }

  const updates = await ctx.db
    .query("maintenanceUpdates")
    .withIndex("by_request", (q) => q.eq("requestId", args.requestId))
    .order("desc")
    .collect();

  return {
    success: true,
    status: request.status,
    request,
    updates,
  };
};


