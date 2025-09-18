import { Doc } from '../../../_generated/dataModel';
import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const updateRequestStatusArgs = v.object({
  requestId: v.id('maintenanceRequests'),
  status: v.union(v.literal('assigned'), v.literal('in_progress'), v.literal('completed'), v.literal('cancelled')),
  description: v.optional(v.string()),
  photos: v.optional(v.array(v.string())),
});

export const updateRequestStatusReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const updateRequestStatusHandler = async (ctx: MutationCtx, args: Infer<typeof updateRequestStatusArgs>) => {
  try {
    console.log('updateRequestStatus called with:', args);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error('User not authenticated');
      return { success: false, message: 'User not authenticated' };
    }

    const me = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), identity.subject))
      .first();
    if (!me) {
      console.error('User not found for clerkId:', identity.subject);
      return { success: false, message: 'User not found' };
    }

    console.log('User found:', me._id, me.role);

    if (me.role !== 'field_technician') {
      console.error('Access denied. User role:', me.role);
      return { success: false, message: 'Access denied. Field technician role required.' };
    }

    // Get the request
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      console.error('Request not found:', args.requestId);
      return { success: false, message: 'Request not found' };
    }

    console.log('Request found:', request._id, 'Status:', request.status, 'Assigned to:', request.assignedTo);

    // Check if the request is assigned to this technician
    if (request.assignedTo !== me._id) {
      console.error('Access denied. Request assigned to:', request.assignedTo, 'User:', me._id);
      return { success: false, message: 'Access denied. Request not assigned to you.' };
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      assigned: ['in_progress', 'cancelled', 'completed', 'assigned'],
      in_progress: ['completed', 'cancelled', 'in_progress', 'assigned'],
      completed: ['completed', 'in_progress', 'assigned'], // Cannot change from completed
      cancelled: ['cancelled', 'in_progress', 'assigned'], // Cannot change from cancelled
    };

    if (!validTransitions[request.status]?.includes(args.status)) {
      console.error('Invalid status transition from', request.status, 'to', args.status);
      return {
        success: false,
        message: `Invalid status transition from ${request.status} to ${args.status}`,
      };
    }

    console.log('Updating request status to:', args.status);

    // Update the request
    const updateData: Partial<Doc<'maintenanceRequests'>> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === 'completed') {
      updateData.actualCompletion = Date.now();
    }

    await ctx.db.patch(args.requestId, updateData);

    console.log('Request updated successfully. Creating maintenance update record...');

    // Create maintenance update record
    const updateRecord = {
      requestId: args.requestId,
      propertyId: request.propertyId,
      status: args.status,
      description: args.description || `Status updated to ${args.status}`,
      updatedBy: me._id,
      photos: args.photos,
      timestamp: Date.now(),
    };

    console.log('Inserting maintenance update:', updateRecord);

    const updateId = await ctx.db.insert('maintenanceUpdates', updateRecord);

    console.log('Maintenance update created with ID:', updateId);

    return {
      success: true,
      message: `Request status updated to ${args.status}`,
    };
  } catch (error) {
    console.error('Error in updateRequestStatus:', error);
    return {
      success: false,
      message: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};
