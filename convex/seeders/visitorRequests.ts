import { Id } from '../_generated/dataModel';
import { mutation } from '../_generated/server';
import { v } from 'convex/values';

// Mock storage IDs for seeding - in production these would be real storage IDs
const mockStorageIds = {
  storage_id_1: 'storage_id_1' as Id<'_storage'>,
  storage_id_2: 'storage_id_2' as Id<'_storage'>,
  storage_id_3: 'storage_id_3' as Id<'_storage'>,
  storage_id_4: 'storage_id_4' as Id<'_storage'>,
  storage_id_5: 'storage_id_5' as Id<'_storage'>,
  storage_id_6: 'storage_id_6' as Id<'_storage'>,
};

export const seedVisitorRequests = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    // Get existing data
    const properties = await ctx.db.query('properties').collect();
    const units = await ctx.db.query('units').collect();
    const users = await ctx.db.query('users').collect();

    if (properties.length === 0 || units.length === 0 || users.length === 0) {
      throw new Error('Required data (properties, units, users) not found. Please run main seeder first.');
    }

    const manager = users.find(u => u.role === 'manager');
    const tenants = users.filter(u => u.role === 'tenant');
    const property1 = properties.find(p => p.name === 'Sunset Apartments') || properties[0];
    const property2 = properties.find(p => p.name === 'Downtown Plaza') || properties[1];

    if (!manager || tenants.length === 0 || !property1 || !property2) {
      throw new Error('Manager, tenants, or properties not found. Please run main seeder first.');
    }

    const property1Units = units.filter(u => u.propertyId === property1._id);
    const property2Units = units.filter(u => u.propertyId === property2._id);

    if (property1Units.length === 0 || property2Units.length === 0) {
      throw new Error('No units found for properties. Please run main seeder first.');
    }

    const visitorRequests = [
      // Property 1 - Approved requests
      {
        propertyId: property1._id,
        unitId: property1Units[0]._id,
        requestedBy: tenants[0]._id,
        visitorName: 'Alice Johnson',
        visitorEmail: 'alice.johnson@email.com',
        visitorPhone: '+1-555-1001',
        visitorIdNumber: 'DL123456789',
        visitorIdType: 'driver_license' as const,
        purpose: 'Family visit',
        expectedArrival: Date.now() + 3600000, // 1 hour from now
        expectedDeparture: Date.now() + 7200000, // 2 hours from now
        numberOfVisitors: 2,
        status: 'approved' as const,
        approvedBy: manager._id,
        approvedAt: Date.now() - 1800000, // 30 minutes ago
        documents: [
          {
            fileName: 'alice_id.jpg',
            storageId: mockStorageIds.storage_id_1,
            fileUrl: 'https://example.com/alice_id.jpg',
            uploadedAt: Date.now() - 3600000,
          },
        ],
        blockchainTxHash: '0x1234567890abcdef1234567890abcdef12345678',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 1800000,
      },
      {
        propertyId: property1._id,
        unitId: property1Units[1]._id,
        requestedBy: tenants[1]._id,
        visitorName: 'Bob Smith',
        visitorEmail: 'bob.smith@email.com',
        visitorPhone: '+1-555-1002',
        visitorIdNumber: 'PAS987654321',
        visitorIdType: 'passport' as const,
        purpose: 'Business meeting',
        expectedArrival: Date.now() + 7200000, // 2 hours from now
        expectedDeparture: Date.now() + 10800000, // 3 hours from now
        numberOfVisitors: 1,
        status: 'approved' as const,
        approvedBy: manager._id,
        approvedAt: Date.now() - 2700000, // 45 minutes ago
        documents: [
          {
            fileName: 'bob_passport.jpg',
            storageId: mockStorageIds.storage_id_2,
            fileUrl: 'https://example.com/bob_passport.jpg',
            uploadedAt: Date.now() - 3600000,
          },
        ],
        blockchainTxHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 2700000,
      },
      // Property 1 - Pending requests
      {
        propertyId: property1._id,
        unitId: property1Units[2]._id,
        requestedBy: tenants[2]._id,
        visitorName: 'Carol Davis',
        visitorEmail: 'carol.davis@email.com',
        visitorPhone: '+1-555-1003',
        visitorIdNumber: 'ID456789123',
        visitorIdType: 'national_id' as const,
        purpose: 'Delivery service',
        expectedArrival: Date.now() + 1800000, // 30 minutes from now
        expectedDeparture: Date.now() + 2700000, // 45 minutes from now
        numberOfVisitors: 1,
        status: 'pending' as const,
        documents: [
          {
            fileName: 'carol_id.jpg',
            storageId: mockStorageIds.storage_id_3,
            fileUrl: 'https://example.com/carol_id.jpg',
            uploadedAt: Date.now() - 1800000,
          },
        ],
        blockchainTxHash: '0x567890abcdef1234567890abcdef1234567890ab',
        createdAt: Date.now() - 1800000,
        updatedAt: Date.now() - 1800000,
      },
      {
        propertyId: property1._id,
        unitId: property1Units[0]._id,
        requestedBy: tenants[0]._id,
        visitorName: 'David Wilson',
        visitorEmail: 'david.wilson@email.com',
        visitorPhone: '+1-555-1004',
        visitorIdNumber: 'DL987654321',
        visitorIdType: 'driver_license' as const,
        purpose: 'Maintenance appointment',
        expectedArrival: Date.now() + 14400000, // 4 hours from now
        expectedDeparture: Date.now() + 18000000, // 5 hours from now
        numberOfVisitors: 1,
        status: 'pending' as const,
        documents: [],
        blockchainTxHash: '0x7890abcdef1234567890abcdef1234567890abcd',
        createdAt: Date.now() - 900000, // 15 minutes ago
        updatedAt: Date.now() - 900000,
      },
      // Property 1 - Denied request
      {
        propertyId: property1._id,
        unitId: property1Units[1]._id,
        requestedBy: tenants[1]._id,
        visitorName: 'Eve Brown',
        visitorEmail: 'eve.brown@email.com',
        visitorPhone: '+1-555-1005',
        visitorIdNumber: 'PAS123456789',
        visitorIdType: 'passport' as const,
        purpose: 'Social visit',
        expectedArrival: Date.now() - 3600000, // 1 hour ago (past)
        expectedDeparture: Date.now() - 1800000, // 30 minutes ago (past)
        numberOfVisitors: 3,
        status: 'denied' as const,
        approvedBy: manager._id,
        approvedAt: Date.now() - 7200000, // 2 hours ago
        deniedReason: 'Too many visitors for the unit capacity',
        documents: [
          {
            fileName: 'eve_passport.jpg',
            storageId: mockStorageIds.storage_id_4,
            fileUrl: 'https://example.com/eve_passport.jpg',
            uploadedAt: Date.now() - 7200000,
          },
        ],
        blockchainTxHash: '0x90abcdef1234567890abcdef1234567890abcdef',
        createdAt: Date.now() - 7200000,
        updatedAt: Date.now() - 7200000,
      },
      // Property 2 - Approved requests
      {
        propertyId: property2._id,
        unitId: property2Units[0]._id,
        requestedBy: tenants[0]._id,
        visitorName: 'Frank Miller',
        visitorEmail: 'frank.miller@email.com',
        visitorPhone: '+1-555-1006',
        visitorIdNumber: 'DL456789123',
        visitorIdType: 'driver_license' as const,
        purpose: 'Contractor work',
        expectedArrival: Date.now() + 10800000, // 3 hours from now
        expectedDeparture: Date.now() + 18000000, // 5 hours from now
        numberOfVisitors: 2,
        status: 'approved' as const,
        approvedBy: manager._id,
        approvedAt: Date.now() - 3600000, // 1 hour ago
        documents: [
          {
            fileName: 'frank_contractor_license.jpg',
            storageId: mockStorageIds.storage_id_5,
            fileUrl: 'https://example.com/frank_contractor_license.jpg',
            uploadedAt: Date.now() - 3600000,
          },
        ],
        blockchainTxHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000,
      },
      // Property 2 - Cancelled request
      {
        propertyId: property2._id,
        unitId: property2Units[1]._id,
        requestedBy: tenants[1]._id,
        visitorName: 'Grace Lee',
        visitorEmail: 'grace.lee@email.com',
        visitorPhone: '+1-555-1007',
        visitorIdNumber: 'ID789123456',
        visitorIdType: 'national_id' as const,
        purpose: 'Package delivery',
        expectedArrival: Date.now() - 7200000, // 2 hours ago (past)
        expectedDeparture: Date.now() - 5400000, // 1.5 hours ago (past)
        numberOfVisitors: 1,
        status: 'cancelled' as const,
        documents: [],
        blockchainTxHash: '0x1234567890abcdef1234567890abcdef12345678',
        createdAt: Date.now() - 7200000,
        updatedAt: Date.now() - 7200000,
      },
      // Property 2 - Expired request
      {
        propertyId: property2._id,
        unitId: property2Units[0]._id,
        requestedBy: tenants[2]._id,
        visitorName: 'Henry Taylor',
        visitorEmail: 'henry.taylor@email.com',
        visitorPhone: '+1-555-1008',
        visitorIdNumber: 'DL789123456',
        visitorIdType: 'driver_license' as const,
        purpose: 'Inspection visit',
        expectedArrival: Date.now() - 86400000, // 1 day ago (past)
        expectedDeparture: Date.now() - 82800000, // 23 hours ago (past)
        numberOfVisitors: 1,
        status: 'expired' as const,
        documents: [
          {
            fileName: 'henry_inspection_id.jpg',
            storageId: mockStorageIds.storage_id_6,
            fileUrl: 'https://example.com/henry_inspection_id.jpg',
            uploadedAt: Date.now() - 86400000,
          },
        ],
        blockchainTxHash: '0x4567890abcdef1234567890abcdef1234567890ab',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
    ];

    const visitorRequestIds: Id<'visitorRequests'>[] = [];
    for (const request of visitorRequests) {
      const id = await ctx.db.insert('visitorRequests', request);
      visitorRequestIds.push(id);
    }

    return visitorRequestIds.length;
  },
});
