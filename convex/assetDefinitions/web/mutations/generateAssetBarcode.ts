import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const generateAssetBarcodeArgs = {
  assetId: v.id('assets'),
} as const;

export const generateAssetBarcodeReturns = v.object({
  barcode: v.string(),
  qrCode: v.string(),
});

type Args = {
  assetId: Id<'assets'>;
};

export const generateAssetBarcodeHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  const asset = await ctx.db.get(args.assetId);
  if (!asset) throw new Error('Asset not found');

  const property = await ctx.db.get(asset.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Generate barcode and QR code (placeholder implementation)
  const barcode = `BC${asset.assetTag}`;
  const qrCode = `QR${asset.assetTag}`;

  return {
    barcode,
    qrCode,
  };
};
