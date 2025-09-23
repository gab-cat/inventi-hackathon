import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { Id } from '../_generated/dataModel';

export const seedDeliveries = mutation({
  args: {},
  returns: v.object({
    deliveries: v.number(),
    deliveryLogs: v.number(),
  }),
  handler: async ctx => {
    // Check if deliveries already exist
    const existingDeliveries = await ctx.db.query('deliveries').collect();
    if (existingDeliveries.length > 0) {
      const existingLogs = await ctx.db.query('deliveryLogs').collect();
      return {
        deliveries: existingDeliveries.length,
        deliveryLogs: existingLogs.length,
      };
    }

    // Get existing data to reference
    const users = await ctx.db.query('users').collect();
    const properties = await ctx.db.query('properties').collect();
    const units = await ctx.db.query('units').collect();

    if (users.length === 0 || properties.length === 0) {
      throw new Error('Required data (users, properties) not found. Please run the main seed first.');
    }

    // Find the specific user (catimbanggabriel@gmail.com)
    const targetUser = users.find(u => u.email === 'catimbanggabriel@gmail.com');
    if (!targetUser) {
      throw new Error('Target user catimbanggabriel@gmail.com not found.');
    }

    // Get some sample properties and units
    const sampleProperties = properties.slice(0, 3); // Take first 3 properties
    const sampleUnits = units.filter(u => sampleProperties.some(p => p._id === u.propertyId)).slice(0, 5); // Take first 5 units from those properties

    // Create comprehensive delivery data
    const deliveries = [
      // Pending deliveries
      {
        propertyId: sampleProperties[0]._id,
        unitId: sampleUnits[0]?._id,
        deliveryType: 'package' as const,
        senderName: 'Amazon',
        senderCompany: 'Amazon.com',
        recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
        recipientPhone: '+63 917 123 4567',
        recipientEmail: targetUser.email,
        trackingNumber: 'AMZ001234567890',
        description: 'Wireless Bluetooth Headphones - Black',
        estimatedDelivery: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
        actualDelivery: undefined,
        status: 'pending' as const,
        deliveryLocation: 'lobby',
        deliveryNotes: 'Fragile item - handle with care',
        photos: [],
        blockchainTxHash: undefined,
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      },
      {
        propertyId: sampleProperties[0]._id,
        unitId: sampleUnits[1]?._id,
        deliveryType: 'food' as const,
        senderName: 'GrabFood',
        senderCompany: 'GrabFood Philippines',
        recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
        recipientPhone: '+63 917 123 4567',
        recipientEmail: targetUser.email,
        trackingNumber: 'GF00123456',
        description: 'Chicken Joy with Jolly Hotdog and Tuna Pie',
        estimatedDelivery: Date.now() + 1 * 60 * 60 * 1000, // 1 hour from now
        actualDelivery: undefined,
        status: 'in_transit' as const,
        deliveryLocation: 'unit',
        deliveryNotes: 'Hot food - please deliver quickly',
        photos: [],
        blockchainTxHash: undefined,
        createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        updatedAt: Date.now() - 15 * 60 * 1000, // 15 minutes ago
      },

      // Delivered but not collected deliveries
      {
        propertyId: sampleProperties[1]._id,
        unitId: sampleUnits[2]?._id,
        deliveryType: 'grocery' as const,
        senderName: 'SM Supermarket',
        senderCompany: 'SM Markets',
        recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
        recipientPhone: '+63 917 123 4567',
        recipientEmail: targetUser.email,
        trackingNumber: 'SM001234567',
        description: 'Weekly grocery delivery - fruits, vegetables, and household items',
        estimatedDelivery: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        actualDelivery: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        status: 'delivered' as const,
        deliveryLocation: 'mailroom',
        deliveryNotes: 'Perishable items included - refrigerate immediately',
        photos: ['https://example.com/delivery1.jpg'],
        blockchainTxHash: '0x1234567890abcdef1234567890abcdef12345678',
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      },
      {
        propertyId: sampleProperties[1]._id,
        unitId: undefined, // Common area delivery
        deliveryType: 'mail' as const,
        senderName: 'Philippine Postal Corporation',
        senderCompany: 'PhilPost',
        recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
        recipientPhone: '+63 917 123 4567',
        recipientEmail: targetUser.email,
        trackingNumber: 'PP001234567PH',
        description: 'Official document and bank statements',
        estimatedDelivery: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        actualDelivery: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        status: 'delivered' as const,
        deliveryLocation: 'lobby',
        deliveryNotes: 'Requires signature upon pickup',
        photos: [],
        blockchainTxHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },

      // Collected deliveries
      {
        propertyId: sampleProperties[2]._id,
        unitId: sampleUnits[3]?._id,
        deliveryType: 'package' as const,
        senderName: 'Lazada',
        senderCompany: 'Lazada Philippines',
        recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
        recipientPhone: '+63 917 123 4567',
        recipientEmail: targetUser.email,
        trackingNumber: 'LZ001234567890',
        description: 'Smartphone case and screen protector',
        estimatedDelivery: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        actualDelivery: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
        status: 'collected' as const,
        deliveryLocation: 'unit',
        deliveryNotes: 'Successfully delivered and collected',
        photos: ['https://example.com/delivery2.jpg', 'https://example.com/delivery3.jpg'],
        blockchainTxHash: '0x78901234567890abcdef1234567890abcdef1234',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      },
      {
        propertyId: sampleProperties[2]._id,
        unitId: sampleUnits[4]?._id,
        deliveryType: 'other' as const,
        senderName: 'FedEx',
        senderCompany: 'Federal Express',
        recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
        recipientPhone: '+63 917 123 4567',
        recipientEmail: targetUser.email,
        trackingNumber: 'FX001234567890',
        description: 'Medical supplies and documents',
        estimatedDelivery: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
        actualDelivery: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        status: 'collected' as const,
        deliveryLocation: 'mailroom',
        deliveryNotes: 'Medical items - kept secure in mailroom',
        photos: [],
        blockchainTxHash: '0x45678901234567890abcdef1234567890abcdef12',
        createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      },

      // Failed delivery
      {
        propertyId: sampleProperties[0]._id,
        unitId: sampleUnits[0]?._id,
        deliveryType: 'package' as const,
        senderName: 'Shopee',
        senderCompany: 'Shopee Philippines',
        recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
        recipientPhone: '+63 917 123 4567',
        recipientEmail: targetUser.email,
        trackingNumber: 'SP001234567890',
        description: 'Electronic device - requires adult signature',
        estimatedDelivery: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        actualDelivery: undefined,
        status: 'failed' as const,
        deliveryLocation: 'unit',
        deliveryNotes: 'Recipient not available - attempted delivery 3 times',
        photos: [],
        blockchainTxHash: undefined,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      },

      // Returned delivery
      {
        propertyId: sampleProperties[1]._id,
        unitId: sampleUnits[1]?._id,
        deliveryType: 'package' as const,
        senderName: 'Zalora',
        senderCompany: 'Zalora Philippines',
        recipientName: 'Jane Doe',
        recipientPhone: '+63 917 987 6543',
        recipientEmail: 'jane.doe@example.com',
        trackingNumber: 'ZL001234567890',
        description: 'Fashion items - dresses and accessories',
        estimatedDelivery: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        actualDelivery: undefined,
        status: 'returned' as const,
        deliveryLocation: 'lobby',
        deliveryNotes: 'Tenant moved out - package returned to sender',
        photos: [],
        blockchainTxHash: undefined,
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      },

      // Recent deliveries for the target user
      {
        propertyId: sampleProperties[0]._id,
        unitId: sampleUnits[0]?._id,
        deliveryType: 'food' as const,
        senderName: 'Foodpanda',
        senderCompany: 'Foodpanda Philippines',
        recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
        recipientPhone: '+63 917 123 4567',
        recipientEmail: targetUser.email,
        trackingNumber: 'FP00123456',
        description: 'Pizza and pasta dinner for two',
        estimatedDelivery: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        actualDelivery: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
        status: 'collected' as const,
        deliveryLocation: 'unit',
        deliveryNotes: 'Hot food delivered successfully',
        photos: [],
        blockchainTxHash: '0x01234567890abcdef1234567890abcdef12345678',
        createdAt: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
        updatedAt: Date.now() - 1 * 60 * 60 * 1000,
      },
      {
        propertyId: sampleProperties[1]._id,
        unitId: sampleUnits[2]?._id,
        deliveryType: 'package' as const,
        senderName: 'Nike',
        senderCompany: 'Nike Philippines',
        recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
        recipientPhone: '+63 917 123 4567',
        recipientEmail: targetUser.email,
        trackingNumber: 'NK001234567890',
        description: 'Running shoes and athletic wear',
        estimatedDelivery: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
        actualDelivery: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
        status: 'collected' as const,
        deliveryLocation: 'unit',
        deliveryNotes: 'Sports equipment - signature required',
        photos: ['https://example.com/delivery4.jpg'],
        blockchainTxHash: '0x89abcdef01234567890abcdef1234567890abcdef',
        createdAt: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
        updatedAt: Date.now() - 4 * 60 * 60 * 1000,
      },
    ];

    // Insert deliveries and collect their IDs
    const deliveryIds: Id<'deliveries'>[] = [];
    for (const delivery of deliveries) {
      const deliveryId = await ctx.db.insert('deliveries', delivery);
      deliveryIds.push(deliveryId);
    }

    // Create delivery logs for audit trail
    const deliveryLogs = [
      // Registration logs
      {
        deliveryId: deliveryIds[0],
        propertyId: sampleProperties[0]._id,
        action: 'registered' as const,
        notes: 'Package registered with delivery service',
        performedBy: targetUser._id,
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      },
      {
        deliveryId: deliveryIds[1],
        propertyId: sampleProperties[0]._id,
        action: 'registered' as const,
        notes: 'Food order placed and confirmed',
        performedBy: targetUser._id,
        timestamp: Date.now() - 30 * 60 * 1000,
        createdAt: Date.now() - 30 * 60 * 1000,
      },

      // Delivery logs
      {
        deliveryId: deliveryIds[2],
        propertyId: sampleProperties[1]._id,
        action: 'delivered' as const,
        notes: 'Package delivered to mailroom successfully',
        performedBy: targetUser._id,
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      },
      {
        deliveryId: deliveryIds[3],
        propertyId: sampleProperties[1]._id,
        action: 'delivered' as const,
        notes: 'Mail delivered to lobby reception',
        performedBy: targetUser._id,
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },

      // Collection logs
      {
        deliveryId: deliveryIds[4],
        propertyId: sampleProperties[2]._id,
        action: 'collected' as const,
        notes: 'Package collected by recipient',
        performedBy: targetUser._id,
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      },
      {
        deliveryId: deliveryIds[5],
        propertyId: sampleProperties[2]._id,
        action: 'collected' as const,
        notes: 'Medical supplies picked up from mailroom',
        performedBy: targetUser._id,
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },

      // Failed delivery logs
      {
        deliveryId: deliveryIds[6],
        propertyId: sampleProperties[0]._id,
        action: 'failed' as const,
        notes: 'First delivery attempt - recipient not available',
        performedBy: targetUser._id,
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
      },
      {
        deliveryId: deliveryIds[6],
        propertyId: sampleProperties[0]._id,
        action: 'failed' as const,
        notes: 'Second delivery attempt - no answer',
        performedBy: targetUser._id,
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
      },
      {
        deliveryId: deliveryIds[6],
        propertyId: sampleProperties[0]._id,
        action: 'failed' as const,
        notes: 'Third delivery attempt - recipient unavailable',
        performedBy: targetUser._id,
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000,
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000,
      },

      // Recent collection logs
      {
        deliveryId: deliveryIds[8],
        propertyId: sampleProperties[0]._id,
        action: 'collected' as const,
        notes: 'Hot food delivered and collected immediately',
        performedBy: targetUser._id,
        timestamp: Date.now() - 1 * 60 * 60 * 1000,
        createdAt: Date.now() - 1 * 60 * 60 * 1000,
      },
      {
        deliveryId: deliveryIds[9],
        propertyId: sampleProperties[1]._id,
        action: 'collected' as const,
        notes: 'Sports equipment signed for and collected',
        performedBy: targetUser._id,
        timestamp: Date.now() - 4 * 60 * 60 * 1000,
        createdAt: Date.now() - 4 * 60 * 60 * 1000,
      },
    ];

    // Insert delivery logs
    const logIds: Id<'deliveryLogs'>[] = [];
    for (const log of deliveryLogs) {
      const logId = await ctx.db.insert('deliveryLogs', log);
      logIds.push(logId);
    }

    return {
      deliveries: deliveryIds.length,
      deliveryLogs: logIds.length,
    };
  },
});
