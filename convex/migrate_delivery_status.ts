// Migration script to validate delivery status values
import { mutation } from './_generated/server';
import { api } from './_generated/api';

export default mutation({
  args: {},
  handler: async ctx => {
    // Find all deliveries
    const deliveries = await ctx.db.query('deliveries').collect();

    const validStatuses = ['registered', 'arrived', 'collected', 'failed', 'returned'];
    let invalidCount = 0;

    for (const delivery of deliveries) {
      if (!validStatuses.includes(delivery.status)) {
        console.log(`Found delivery ${delivery._id} with invalid status: ${delivery.status}`);
        invalidCount++;
      }
    }

    console.log(`Validation complete. Found ${invalidCount} deliveries with invalid statuses.`);
    return { invalidCount, totalDeliveries: deliveries.length };
  },
});
