import { mutation, MutationCtx } from './_generated/server';
import { v } from 'convex/values';

/**
 * Centralized file upload utilities
 * All upload URL generation should go through this file
 */

// Args for generating upload URLs
export const generateUploadUrlArgs = v.object({
  fileType: v.optional(
    v.union(v.literal('image'), v.literal('document'), v.literal('pdf'), v.literal('video'), v.literal('other'))
  ),
  maxSize: v.optional(v.number()), // Max file size in bytes
});

// Returns for upload URL generation
export const generateUploadUrlReturns = v.object({
  success: v.boolean(),
  uploadUrl: v.optional(v.string()),
  message: v.optional(v.string()),
});

// Handler for generating upload URLs
export const generateUploadUrlHandler = async (ctx: MutationCtx) => {
  try {
    // Generate the upload URL
    const uploadUrl = await ctx.storage.generateUploadUrl();

    return {
      success: true,
      uploadUrl,
      message: 'Upload URL generated successfully',
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return {
      success: false,
      message: 'Failed to generate upload URL. Please try again.',
    };
  }
};

// Main mutation for generating upload URLs
export const generateUploadUrl = mutation({
  args: generateUploadUrlArgs,
  returns: generateUploadUrlReturns,
  handler: generateUploadUrlHandler,
});

// Args for deleting uploaded files
export const deleteUploadedFileArgs = v.object({
  storageId: v.id('_storage'),
});

// Returns for deleting uploaded files
export const deleteUploadedFileReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
});

// Main mutation for deleting uploaded files
export const deleteUploadedFile = mutation({
  args: deleteUploadedFileArgs,
  returns: deleteUploadedFileReturns,
  handler: async (ctx, args) => {
    try {
      // Delete the file from storage
      await ctx.storage.delete(args.storageId);

      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting uploaded file:', error);
      return {
        success: false,
        message: 'Failed to delete file. Please try again.',
      };
    }
  },
});
