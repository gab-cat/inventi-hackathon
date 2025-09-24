import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const mobileUploadChatAttachmentArgs = v.object({
  fileName: v.string(),
  fileType: v.string(),
  fileSize: v.number(),
  fileData: v.string(), // Base64 encoded file data
});

export const mobileUploadChatAttachmentReturns = v.object({
  success: v.boolean(),
  attachment: v.optional(
    v.object({
      fileName: v.string(),
      fileUrl: v.string(),
      fileType: v.string(),
      fileSize: v.number(),
    })
  ),
  message: v.optional(v.string()),
});

export const mobileUploadChatAttachmentHandler = async (ctx: any, args: any) => {
  const { fileName, fileType, fileSize, fileData } = args;

  // Get current user
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  // Validate file size (limit to 10MB)
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  if (fileSize > maxFileSize) {
    return {
      success: false,
      message: 'File size exceeds maximum limit of 10MB',
    };
  }

  // Validate file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(fileType.toLowerCase())) {
    return {
      success: false,
      message: 'File type not supported',
    };
  }

  try {
    // Convert base64 to blob
    const binaryString = atob(fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate upload URL
    const uploadUrl = await ctx.storage.generateUploadUrl();

    // Upload file
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': fileType,
      },
      body: bytes,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const responseData = await response.json();
    const { storageId } = responseData;

    if (!storageId) {
      throw new Error('No storageId returned from upload');
    }

    // Get public URL
    const fileUrl = await ctx.storage.getUrl(storageId);

    // Save file reference in database
    await ctx.db.insert('_storage', {
      _id: storageId,
      _creationTime: Date.now(),
      contentType: fileType,
      sha256: '', // Will be set by Convex
      size: fileSize,
    });

    return {
      success: true,
      attachment: {
        fileName,
        fileUrl,
        fileType,
        fileSize,
      },
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'File upload failed',
    };
  }
};

export type MobileUploadChatAttachmentArgs = typeof mobileUploadChatAttachmentArgs;
export type MobileUploadChatAttachmentReturns = typeof mobileUploadChatAttachmentReturns;
export type MobileUploadChatAttachmentHandler = typeof mobileUploadChatAttachmentHandler;
