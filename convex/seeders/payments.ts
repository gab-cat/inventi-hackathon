import { Id } from '../_generated/dataModel';
import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const seedPayments = mutation({
  args: {},
  returns: v.object({
    invoicesCreated: v.number(),
    paymentsCreated: v.number(),
    receiptsCreated: v.number(),
  }),
  handler: async (ctx): Promise<{ invoicesCreated: number; paymentsCreated: number; receiptsCreated: number }> => {
    // Find the specific user by email
    const targetUser = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('email'), 'catimbanggabriel@gmail.com'))
      .first();

    if (!targetUser) {
      throw new Error('User with email catimbanggabriel@gmail.com not found. Please ensure this user exists first.');
    }

    // Get properties and units for the user
    const properties = await ctx.db.query('properties').collect();
    if (properties.length === 0) {
      throw new Error('No properties found. Please run property seeders first.');
    }

    // Find a unit assigned to this user
    const userUnit = await ctx.db
      .query('units')
      .filter(q => q.eq(q.field('tenantId'), targetUser._id))
      .first();

    const propertyId = properties[0]._id; // Use first property as default
    const unitId = userUnit?._id;

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const fifteenDaysAgo = now - 15 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    const futureDate = now + 30 * 24 * 60 * 60 * 1000; // 30 days from now

    let invoicesCreated = 0;
    let paymentsCreated = 0;
    let receiptsCreated = 0;

    // Create various types of invoices with different statuses
    const invoicesData = [
      // Paid invoices
      {
        invoiceNumber: 'INV-2025-001',
        invoiceType: 'rent' as const,
        description: 'Monthly Rent - January 2025',
        amount: 2500.0,
        totalAmount: 2500.0,
        dueDate: fifteenDaysAgo,
        status: 'paid' as const,
        paidAt: sevenDaysAgo,
        paymentMethod: 'credit_card' as const,
        items: [{ description: 'Base Rent', amount: 2500.0, quantity: 1 }],
        createdAt: thirtyDaysAgo,
      },
      {
        invoiceNumber: 'INV-2025-002',
        invoiceType: 'utility' as const,
        description: 'Electricity Bill - December 2024',
        amount: 125.5,
        totalAmount: 125.5,
        dueDate: sevenDaysAgo,
        status: 'paid' as const,
        paidAt: threeDaysAgo,
        paymentMethod: 'bank_transfer' as const,
        items: [{ description: 'Electricity Usage', amount: 125.5, quantity: 1 }],
        createdAt: fifteenDaysAgo,
      },
      {
        invoiceNumber: 'INV-2025-003',
        invoiceType: 'maintenance' as const,
        description: 'Plumbing Repair Service',
        amount: 85.0,
        totalAmount: 85.0,
        dueDate: threeDaysAgo,
        status: 'paid' as const,
        paidAt: now - 24 * 60 * 60 * 1000, // 1 day ago
        paymentMethod: 'cash' as const,
        items: [{ description: 'Plumbing Repair', amount: 85.0, quantity: 1 }],
        createdAt: sevenDaysAgo,
      },
      // Pending invoice
      {
        invoiceNumber: 'INV-2025-004',
        invoiceType: 'rent' as const,
        description: 'Monthly Rent - February 2025',
        amount: 2500.0,
        totalAmount: 2500.0,
        dueDate: futureDate,
        status: 'pending' as const,
        items: [{ description: 'Base Rent', amount: 2500.0, quantity: 1 }],
        createdAt: now - 24 * 60 * 60 * 1000,
      },
      // Overdue invoice
      {
        invoiceNumber: 'INV-2025-005',
        invoiceType: 'fine' as const,
        description: 'Late Payment Fee',
        amount: 50.0,
        totalAmount: 50.0,
        dueDate: sevenDaysAgo,
        status: 'overdue' as const,
        items: [{ description: 'Late Payment Fee', amount: 50.0, quantity: 1 }],
        createdAt: fifteenDaysAgo,
      },
    ];

    // Create invoices and corresponding payments/receipts
    for (const invoiceData of invoicesData) {
      const invoiceId = await ctx.db.insert('invoices', {
        propertyId,
        unitId,
        tenantId: targetUser._id,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceType: invoiceData.invoiceType,
        description: invoiceData.description,
        amount: invoiceData.amount,
        taxAmount: 0,
        totalAmount: invoiceData.totalAmount,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        paidAt: invoiceData.paidAt,
        paymentMethod: invoiceData.paymentMethod,
        items: invoiceData.items,
        blockchainTxHash: undefined,
        createdAt: invoiceData.createdAt,
        updatedAt: invoiceData.createdAt,
      });
      invoicesCreated++;

      // Create payment and receipt for paid invoices
      if (invoiceData.status === 'paid' && invoiceData.paidAt) {
        const paymentId = await ctx.db.insert('payments', {
          invoiceId,
          propertyId,
          tenantId: targetUser._id,
          amount: invoiceData.totalAmount,
          paymentMethod: invoiceData.paymentMethod!,
          paymentReference: `${invoiceData.paymentMethod}_${Date.now()}`,
          status: 'completed' as const,
          processedAt: invoiceData.paidAt,
          blockchainTxHash: `0x${Math.random().toString(16).substring(2, 66)}`,
          createdAt: invoiceData.paidAt,
        });
        paymentsCreated++;

        // Generate receipt number
        const receiptNumber = `RCT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create receipt with NFT
        const receiptId = await ctx.db.insert('receipts', {
          paymentId,
          invoiceId,
          propertyId,
          tenantId: targetUser._id,
          receiptNumber,
          amount: invoiceData.totalAmount,
          nftTokenId: `NFT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          nftContractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          blockchainTxHash: `0x${Math.random().toString(16).substring(2, 66)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 20000000,
          metadata: {
            description: `Payment receipt for ${invoiceData.description}`,
            items: invoiceData.items.map(item => item.description),
            timestamp: invoiceData.paidAt,
          },
          createdAt: invoiceData.paidAt,
        });
        receiptsCreated++;
      }
    }

    return {
      invoicesCreated,
      paymentsCreated,
      receiptsCreated,
    };
  },
});
