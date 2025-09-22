import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';
import { api } from '../../../_generated/api';

export const generateMaintenancePhotoUploadUrlArgs = v.object({});

export const generateMaintenancePhotoUploadUrlReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  uploadUrl: v.optional(v.string()),
});

export const saveUploadedPhotoArgs = v.object({
  storageId: v.id('_storage'),
  fileName: v.string(),
  contentType: v.string(),
});

export const saveUploadedPhotoReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  fileUrl: v.optional(v.string()),
  fileId: v.optional(v.id('_storage')),
});

// Generate upload URL for maintenance photos using centralized file service
export const generateMaintenancePhotoUploadUrlHandler = async (
  ctx: MutationCtx
): Promise<Infer<typeof generateMaintenancePhotoUploadUrlReturns>> => {
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

  try {
    // Generate upload URL using centralized file service
    const result = await ctx.runMutation(api.file.generateUploadUrl, {
      fileType: 'image',
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message || 'Failed to generate upload URL',
      };
    }

    return {
      success: true,
      message: 'Upload URL generated successfully',
      uploadUrl: result.uploadUrl,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to generate upload URL: ' + (error as Error).message,
    };
  }
};

// Save the uploaded photo's storage ID after client uploads
export const saveUploadedPhotoHandler = async (ctx: MutationCtx, args: Infer<typeof saveUploadedPhotoArgs>) => {
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

  try {
    // Get the file URL from storage ID
    const fileUrl = await ctx.storage.getUrl(args.storageId);

    if (!fileUrl) {
      return { success: false, message: 'Failed to generate file URL' };
    }

    return {
      success: true,
      message: 'Photo saved successfully',
      fileUrl,
      fileId: args.storageId,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to save photo: ' + (error as Error).message,
    };
  }
};
