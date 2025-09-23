import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { handleClerkEvent } from './webhook';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';

const http = httpRouter();

http.route({
  path: '/webhook/clerk',
  method: 'POST',
  handler: httpAction(handleClerkEvent),
});

// Visitor document upload HTTP action
http.route({
  path: '/upload-visitor-document',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Get parameters from query string
      const url = new URL(request.url);
      const requestId = url.searchParams.get('requestId');
      const documentType = url.searchParams.get('documentType');
      const fileName = url.searchParams.get('fileName');

      if (!requestId || !documentType || !fileName) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Missing required parameters: requestId, documentType, fileName',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify user authentication
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'User not authenticated',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify the visitor request exists and user has access using the mutation
      // This will handle all the validation logic

      // Store the file
      const blob = await request.blob();
      const storageId = await ctx.storage.store(blob);

      // Get URL for the stored file
      const fileUrl = await ctx.storage.getUrl(storageId);
      if (!fileUrl) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Failed to generate file URL',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Save the document info using the mutation
      const saveResult = await ctx.runMutation(api.visitorRequest.saveUploadedVisitorDocument, {
        requestId: requestId as Id<'visitorRequests'>,
        storageId: storageId,
        fileName,
        contentType: request.headers.get('content-type') || 'application/octet-stream',
        documentType,
      });

      if (!saveResult.success) {
        return new Response(
          JSON.stringify({
            success: false,
            message: saveResult.message || 'Failed to save document information',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          storageId,
          fileUrl,
          message: 'Document uploaded successfully',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error uploading visitor document:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to upload document. Please try again.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }),
});

export default http;
