import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const addMaintenancePhotoArgs = v.object({
  requestId: v.id('maintenanceRequests'),
  photoUrl: v.string(),
  description: v.optional(v.string()),
  photoType: v.union(v.literal('before'), v.literal('during'), v.literal('after')),
});

export const addMaintenancePhotoReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const addMaintenancePhotoHandler = async (ctx: MutationCtx, args: Infer<typeof addMaintenancePhotoArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, message: 'User not found' };
  }

  if (me.role !== 'field_technician') {
    return { success: false, message: 'Access denied. Field technician role required.' };
  }

  // Get the request
  const request = await ctx.db.get(args.requestId);
  if (!request) {
    return { success: false, message: 'Request not found' };
  }

  // Check if the request is assigned to this technician
  if (request.assignedTo !== me._id) {
    return { success: false, message: 'Access denied. Request not assigned to you.' };
  }

  // Get existing photos or initialize empty array
  const existingPhotos = request.photos || [];

  // Add the new photo URL
  const updatedPhotos = [...existingPhotos, args.photoUrl];

  // Update the request with the new photo
  await ctx.db.patch(args.requestId, {
    photos: updatedPhotos,
    updatedAt: Date.now(),
  });

  // Create maintenance update record for the photo addition
  const description = args.description || `Added ${args.photoType} photo to maintenance request`;

  await ctx.db.insert('maintenanceUpdates', {
    requestId: args.requestId,
    propertyId: request.propertyId,
    status: request.status, // Keep current status
    description,
    updatedBy: me._id,
    photos: [args.photoUrl], // Include the photo in the update
    timestamp: Date.now(),
  });

  return {
    success: true,
    message: `${args.photoType} photo added successfully`,
  };
};
