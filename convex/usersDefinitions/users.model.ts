import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const users = defineTable({
  clerkId: v.string(), // Clerk authentication ID
  walletAddress: v.string(),
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  phone: v.optional(v.string()),
  profileImage: v.optional(v.string()),
  roles: v.array(
    v.union(v.literal('manager'), v.literal('tenant'), v.literal('vendor'), v.literal('field_technician'))
  ),
  isActive: v.boolean(),
  lastLoginAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_clerk_id', ['clerkId'])
  .index('by_email', ['email'])
  .index('by_roles', ['roles'])
  .index('by_active', ['isActive']);
