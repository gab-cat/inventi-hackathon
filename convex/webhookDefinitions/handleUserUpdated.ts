import { v, Infer } from 'convex/values';
import { MutationCtx } from '../_generated/server';

export const handleUserUpdatedArgs = v.object({
  clerkId: v.string(),
  email: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  phone: v.optional(v.string()),
  profileImage: v.optional(v.string()),
});

export const handleUserUpdatedHandler = async (ctx: MutationCtx, args: Infer<typeof handleUserUpdatedArgs>) => {
  const { clerkId, email, firstName, lastName, phone, profileImage } = args;

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', clerkId))
    .first();

  if (!user) {
    // Create new user if required fields are provided
    if (!email || !firstName || !lastName) {
      throw new Error('Cannot create user - missing required fields: email, firstName, lastName');
    }

    const userId = await ctx.db.insert('users', {
      clerkId,
      email,
      firstName,
      lastName,
      phone: phone || undefined,
      profileImage: profileImage || undefined,
      role: 'tenant', // Default role
      isActive: true,
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return userId;
  }

  // Update existing user
  const update: Partial<typeof user> = {
    updatedAt: Date.now(),
  };

  if (email !== undefined) update.email = email;
  if (firstName !== undefined) update.firstName = firstName;
  if (lastName !== undefined) update.lastName = lastName;
  if (phone !== undefined) update.phone = phone;
  if (profileImage !== undefined) update.profileImage = profileImage;

  await ctx.db.patch(user._id, update);
  return user._id;
};
