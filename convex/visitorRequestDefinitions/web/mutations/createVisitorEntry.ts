import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webCreateVisitorEntryArgs = {
  propertyId: v.id('properties'),
  unitId: v.id('units'),
  visitorName: v.string(),
  visitorEmail: v.optional(v.string()),
  visitorPhone: v.optional(v.string()),
  visitorIdNumber: v.optional(v.string()),
  visitorIdType: v.optional(v.string()),
  purpose: v.string(),
  expectedArrival: v.number(),
  expectedDeparture: v.optional(v.number()),
  numberOfVisitors: v.number(),
  documents: v.optional(
    v.array(
      v.object({
        fileName: v.string(),
        fileUrl: v.string(),
        uploadedAt: v.number(),
      })
    )
  ),
} as const;

export const webCreateVisitorEntryReturns = v.id('visitorRequests');

type Args = {
  propertyId: Id<'properties'>;
  unitId: Id<'units'>;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorIdNumber?: string;
  visitorIdType?: string;
  purpose: string;
  expectedArrival: number;
  expectedDeparture?: number;
  numberOfVisitors: number;
  documents?: Array<{
    fileName: string;
    fileUrl: string;
    uploadedAt: number;
  }>;
};

export const webCreateVisitorEntryHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'manager') {
    throw new Error('Only managers can create visitor entries');
  }

  const visitorRequestId = await ctx.db.insert('visitorRequests', {
    propertyId: args.propertyId,
    unitId: args.unitId,
    requestedBy: user._id,
    visitorName: args.visitorName,
    visitorEmail: args.visitorEmail,
    visitorPhone: args.visitorPhone,
    visitorIdNumber: args.visitorIdNumber,
    visitorIdType: args.visitorIdType,
    purpose: args.purpose,
    expectedArrival: args.expectedArrival,
    expectedDeparture: args.expectedDeparture,
    numberOfVisitors: args.numberOfVisitors,
    status: 'approved', // Manager-created entries are auto-approved
    approvedBy: user._id,
    approvedAt: Date.now(),
    documents: args.documents,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return visitorRequestId;
};
