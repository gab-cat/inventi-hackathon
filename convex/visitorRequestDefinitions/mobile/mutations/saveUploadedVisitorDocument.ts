import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { Infer, v } from 'convex/values';

export const mobileSaveUploadedVisitorDocumentArgs = v.object({
  requestId: v.id('visitorRequests'),
  storageId: v.string(),
  fileName: v.string(),
  contentType: v.string(),
  documentType: v.optional(v.string()),
});

export const mobileSaveUploadedVisitorDocumentReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
});

export const mobileSaveUploadedVisitorDocumentHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileSaveUploadedVisitorDocumentArgs>
) => {
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
    // Get the file URL from storage
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      return { success: false, message: 'Failed to get file URL from storage' };
    }

    // Update the visitor request with the new document
    const currentDocuments = request.documents || [];
    const newDocument = {
      fileName: args.fileName,
      storageId: args.storageId as Id<'_storage'>,
      fileUrl,
      uploadedAt: Date.now(),
    };

    await ctx.db.patch(args.requestId, {
      documents: [...currentDocuments, newDocument],
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: 'Document uploaded successfully',
    };
  } catch (error) {
    console.error('Error saving uploaded document:', error);
    return { success: false, message: 'Failed to save uploaded document. Please try again.' };
  }
};
