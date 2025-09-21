import { QueryCtx } from "../../../_generated/server";
import { Id } from "../../../_generated/dataModel";
import { v } from "convex/values";

export const getRequestsArgs = v.object({
  propertyId: v.optional(v.id("properties")),
  status: v.optional(v.string()),
  requestType: v.optional(v.string()),
  assignedToMe: v.optional(v.boolean()),
  mine: v.optional(v.boolean()),
});

export const getRequestsHandler = async (
  ctx: QueryCtx,
  args: {
    propertyId?: Id<"properties">;
    status?: string;
    requestType?: string;
    assignedToMe?: boolean;
    mine?: boolean;
  }
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: "User not authenticated" };
  }

  // Collect then filter to avoid type narrowing issues with reassigning query builders
  let all = await ctx.db.query("maintenanceRequests").collect();

  if (args.status) all = all.filter((r) => r.status === args.status);
  if (args.requestType) all = all.filter((r) => r.requestType === args.requestType);
  if (args.propertyId) all = all.filter((r) => r.propertyId === args.propertyId);
  if (args.mine) all = all.filter((r) => r.requestedBy === (identity._id as Id<"users">));
  if (args.assignedToMe) all = all.filter((r) => r.assignedTo === (identity._id as Id<"users">));

  return { success: true, requests: all };
};


