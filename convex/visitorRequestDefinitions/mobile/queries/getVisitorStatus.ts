import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { Infer, v } from 'convex/values';

export const mobileGetVisitorStatusArgs = v.object({
  requestId: v.id('visitorRequests'),
});

export const mobileGetVisitorStatusReturns = v.object({
  success: v.boolean(),
  visitor: v.optional(
    v.object({
      _id: v.id('visitorRequests'),
      visitorName: v.string(),
      visitorEmail: v.optional(v.string()),
      visitorPhone: v.optional(v.string()),
      purpose: v.string(),
      expectedArrival: v.number(),
      expectedDeparture: v.optional(v.number()),
      numberOfVisitors: v.number(),
      status: v.string(),
      propertyId: v.id('properties'),
      unitId: v.id('units'),
      createdAt: v.number(),
      approvedAt: v.optional(v.number()),
      deniedReason: v.optional(v.string()),
      documents: v.optional(
        v.array(
          v.object({
            fileName: v.string(),
            fileUrl: v.optional(v.string()),
            uploadedAt: v.number(),
          })
        )
      ),
      // Include visitor log information
      checkInTime: v.optional(v.number()),
      checkOutTime: v.optional(v.number()),
      lastAction: v.optional(v.string()),
    })
  ),
  message: v.optional(v.string()),
});

export const mobileGetVisitorStatusHandler = async (ctx: QueryCtx, args: Infer<typeof mobileGetVisitorStatusArgs>) => {
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

  // Get the visitor request
  const request = await ctx.db.get(args.requestId);
  if (!request) {
    return { success: false, message: 'Visitor request not found' };
  }

  // Check if user has access to this request (either owner or property manager)
  const isOwner = request.requestedBy === me._id;

  let hasAccess = isOwner;
  if (!hasAccess) {
    // Check if user is a property manager for this property
    const userProperty = await ctx.db
      .query('userProperties')
      .withIndex('by_user_property', q => q.eq('userId', me._id).eq('propertyId', request.propertyId))
      .first();

    hasAccess = userProperty?.role === 'manager';
  }

  if (!hasAccess) {
    return { success: false, message: 'You do not have access to this visitor request' };
  }

  // Get visitor logs to determine check-in/out status
  const logs = await ctx.db
    .query('visitorLogs')
    .withIndex('by_visitor_request', q => q.eq('visitorRequestId', args.requestId))
    .collect();

  // Sort logs by timestamp to get latest status
  logs.sort((a, b) => b.timestamp - a.timestamp);

  let checkInTime: number | undefined;
  let checkOutTime: number | undefined;
  let lastAction: string | undefined;

  for (const log of logs) {
    if (log.action === 'check_in' && !checkInTime) {
      checkInTime = log.timestamp;
      lastAction = 'checked_in';
    } else if (log.action === 'check_out' && !checkOutTime) {
      checkOutTime = log.timestamp;
      lastAction = 'checked_out';
    } else if (log.action === 'no_show') {
      lastAction = 'no_show';
    }
  }

  // Populate file URLs for documents if storageId exists but fileUrl is missing/empty
  let documentsWithUrls = request.documents;
  if (request.documents && request.documents.length > 0) {
    documentsWithUrls = await Promise.all(
      request.documents.map(
        async (doc: { fileName: string; storageId?: Id<'_storage'>; fileUrl?: string; uploadedAt: number }) => {
          let fileUrl = doc.fileUrl;
          if (doc.storageId && (!fileUrl || fileUrl.trim() === '')) {
            fileUrl = (await ctx.storage.getUrl(doc.storageId)) || '';
          }
          return {
            ...doc,
            fileUrl: fileUrl || '',
          };
        }
      )
    );
  }

  return {
    success: true,
    visitor: {
      ...request,
      documents: documentsWithUrls,
      checkInTime,
      checkOutTime,
      lastAction,
    },
  };
};
