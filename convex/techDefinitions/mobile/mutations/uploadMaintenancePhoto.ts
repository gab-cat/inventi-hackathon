import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const generateUploadUrlArgs = v.object({});

export const generateUploadUrlReturns = v.object({
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

// Generate upload URL for client to upload file directly
export const generateUploadUrlHandler = async (ctx: MutationCtx) => {
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
  console.log('User found:', me._id, me.role);
  try {
    // Generate upload URL - expires in 1 hour
    const uploadUrl = await ctx.storage.generateUploadUrl();
    console.log('Upload URL:', uploadUrl);

    return {
      success: true,
      message: 'Upload URL generated successfully',
      uploadUrl,
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
