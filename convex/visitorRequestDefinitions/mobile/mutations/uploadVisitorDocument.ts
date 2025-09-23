import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { Infer, v } from 'convex/values';
import { api } from '../../../_generated/api';

export const mobileUploadVisitorDocumentArgs = v.object({
  requestId: v.id('visitorRequests'),
  fileType: v.optional(
    v.union(v.literal('image'), v.literal('document'), v.literal('pdf'), v.literal('video'), v.literal('other'))
  ),
});

export const mobileUploadVisitorDocumentReturns = v.object({
  success: v.boolean(),
  uploadUrl: v.optional(v.string()),
  message: v.optional(v.string()),
});

export const mobileUploadVisitorDocumentHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileUploadVisitorDocumentArgs>
): Promise<Infer<typeof mobileUploadVisitorDocumentReturns>> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  // Get the visitor request
  const request = await ctx.db.get(args.requestId);
  if (!request) {
    return { success: false, message: 'Visitor request not found' };
  }

  // Check if user owns this request
  if (request.requestedBy !== (identity._id as Id<'users'>)) {
    return { success: false, message: 'You can only upload documents for your own visitor requests' };
  }

  // Only allow uploads for pending or approved requests
  if (!['pending', 'approved'].includes(request.status)) {
    return { success: false, message: 'Cannot upload documents for requests in this status' };
  }

  try {
    // Generate upload URL using centralized file service
    const result: { success: boolean; uploadUrl?: string; message?: string } = await ctx.runMutation(
      api.file.generateUploadUrl,
      {
        fileType: args.fileType || 'document',
      }
    );

    if (!result.success) {
      return { success: false, message: result.message || 'Failed to generate upload URL' };
    }

    return {
      success: true,
      uploadUrl: result.uploadUrl,
      message: 'Upload URL generated successfully',
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return { success: false, message: 'Failed to generate upload URL. Please try again.' };
  }
};
