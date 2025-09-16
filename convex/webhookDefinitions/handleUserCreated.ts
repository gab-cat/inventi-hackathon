
import { Infer, v } from "convex/values";
import { MutationCtx } from "../_generated/server";

export const handleUserCreatedArgs = v.object({
  clerkId: v.string(),
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  phone: v.optional(v.string()),
  profileImage: v.string(),
})

export const handleUserCreatedHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof handleUserCreatedArgs>,
) => {
  const { clerkId, email, firstName, lastName, phone, profileImage } = args;

  const existingUser = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), clerkId)).first();
  if (existingUser) {
    throw new Error("User already exists");
  }

  const existingEmail = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), email)).first();
  if (existingEmail) {
    throw new Error("Email already exists");
  }

  const user = await ctx.db.insert("users", {
    clerkId,
    email,
    firstName,
    lastName,
    phone,
    profileImage,
    roles: ["tenant"],
    isActive: true,
    lastLoginAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return user;
}