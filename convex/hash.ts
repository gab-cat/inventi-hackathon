'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';

export const hashPii = action({
  args: {
    recipientName: v.string(),
    recipientPhone: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    piiHash: v.optional(v.string()),
    message: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Generate PII hash for blockchain operations
      const crypto = require('crypto');
      const piiData = `${args.recipientName}${args.recipientPhone || ''}${args.recipientEmail || ''}${Date.now()}`;
      const piiHash = crypto.createHash('sha256').update(piiData).digest('hex');

      return {
        success: true,
        piiHash: `0x${piiHash}`,
      };
    } catch (error) {
      console.error('PII hashing failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to hash PII data',
      };
    }
  },
});
