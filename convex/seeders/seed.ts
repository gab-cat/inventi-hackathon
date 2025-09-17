import { Id } from '../_generated/dataModel';
import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { api } from '../_generated/api';

export const seedDatabase = mutation({
  args: {},
  returns: v.object({
    properties: v.number(),
    units: v.number(),
    users: v.number(),
    maintenanceRequests: v.number(),
    notices: v.number(),
    events: v.number(),
    polls: v.number(),
    acknowledgments: v.number(),
  }),
  handler: async (
    ctx
  ): Promise<{
    properties: number;
    units: number;
    users: number;
    maintenanceRequests: number;
    notices: number;
    events: number;
    polls: number;
    acknowledgments: number;
  }> => {
    // Create the manager user first
    const managerId = await ctx.db.insert('users', {
      clerkId: 'user_32msooiDCcy4XFaNVVRL3wIlIg1',
      email: 'meatole.cs@gmail.com',
      firstName: 'Martin Edgar',
      lastName: 'Atole',
      role: 'manager' as const,
      isActive: true,
      profileImage:
        'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMm1zb3JXTktZQnphbzBCbnhoek5zTGhiUmoifQ',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLoginAt: Date.now(),
    });

    // Create properties
    const property1Id = await ctx.db.insert('properties', {
      name: 'Sunset Apartments',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      propertyType: 'apartment',
      totalUnits: 50,
      managerId: managerId,
      isActive: true,
      settings: {
        visitorLimitPerUnit: 2,
        deliveryHours: {
          start: '08:00',
          end: '20:00',
        },
        maintenanceHours: {
          start: '07:00',
          end: '19:00',
        },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert('properties', {
      name: 'Downtown Plaza',
      address: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA',
      propertyType: 'condo',
      totalUnits: 30,
      managerId: managerId,
      isActive: true,
      settings: {
        visitorLimitPerUnit: 3,
        deliveryHours: {
          start: '09:00',
          end: '21:00',
        },
        maintenanceHours: {
          start: '08:00',
          end: '18:00',
        },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create additional users (tenants and technicians)
    const tenant1Id = await ctx.db.insert('users', {
      clerkId: 'user_tenant_001',
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0101',
      profileImage: '',
      role: 'tenant',
      isActive: true,
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const tenant2Id = await ctx.db.insert('users', {
      clerkId: 'user_tenant_002',
      email: 'jane.smith@email.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0102',
      profileImage: '',
      role: 'tenant',
      isActive: true,
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const tenant3Id = await ctx.db.insert('users', {
      clerkId: 'user_tenant_003',
      email: 'mike.johnson@email.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '+1-555-0103',
      profileImage: '',
      role: 'tenant',
      isActive: true,
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const technician1Id = await ctx.db.insert('users', {
      clerkId: 'user_tech_001',
      email: 'tech1@maintenance.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      phone: '+1-555-0201',
      profileImage: '',
      role: 'field_technician',
      isActive: true,
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const technician2Id = await ctx.db.insert('users', {
      clerkId: 'user_tech_002',
      email: 'tech2@maintenance.com',
      firstName: 'Sarah',
      lastName: 'Davis',
      phone: '+1-555-0202',
      profileImage: '',
      role: 'field_technician',
      isActive: true,
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create units
    const units = [];
    for (let i = 1; i <= 10; i++) {
      const unitId = await ctx.db.insert('units', {
        propertyId: property1Id,
        unitNumber: `10${i}`,
        unitType: 'apartment',
        floor: Math.floor(i / 4) + 1,
        bedrooms: i % 3 === 0 ? 2 : 1,
        bathrooms: 1,
        squareFootage: 800 + i * 50,
        rentAmount: 2500 + i * 100,
        tenantId: i <= 3 ? (i === 1 ? tenant1Id : i === 2 ? tenant2Id : tenant3Id) : undefined,
        isOccupied: i <= 3,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      units.push(unitId);
    }

    // Create maintenance requests
    const maintenanceRequests = [
      {
        propertyId: property1Id,
        unitId: units[0],
        requestedBy: tenant1Id,
        requestType: 'plumbing' as const,
        priority: 'high' as const,
        title: 'Kitchen Sink Leak',
        description:
          'Water is leaking from under the kitchen sink. The leak appears to be coming from the pipe connection. Water is pooling on the floor and needs immediate attention.',
        location: 'Unit 101 - Kitchen',
        status: 'pending' as const,
        assignedTo: undefined,
        assignedAt: undefined,
        estimatedCost: 150,
        actualCost: undefined,
        estimatedCompletion: undefined,
        actualCompletion: undefined,
        photos: ['https://example.com/leak1.jpg', 'https://example.com/leak2.jpg'],
        documents: [],
        tenantApproval: undefined,
        tenantApprovalAt: undefined,
        createdAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 86400000,
      },
      {
        propertyId: property1Id,
        unitId: units[1],
        requestedBy: tenant2Id,
        requestType: 'electrical' as const,
        priority: 'emergency' as const,
        title: 'Power Outage in Living Room',
        description:
          'Complete power loss in the living room. No outlets or lights working. This is affecting work from home setup.',
        location: 'Unit 102 - Living Room',
        status: 'assigned' as const,
        assignedTo: technician1Id,
        assignedAt: Date.now() - 3600000, // 1 hour ago
        estimatedCost: 200,
        actualCost: undefined,
        estimatedCompletion: Date.now() + 86400000, // 1 day from now
        actualCompletion: undefined,
        photos: [],
        documents: [],
        tenantApproval: true,
        tenantApprovalAt: Date.now() - 3600000,
        createdAt: Date.now() - 7200000, // 2 hours ago
        updatedAt: Date.now() - 3600000,
      },
      {
        propertyId: property1Id,
        unitId: units[2],
        requestedBy: tenant3Id,
        requestType: 'hvac' as const,
        priority: 'medium' as const,
        title: 'Heating Not Working',
        description:
          'The heating system is not producing warm air. The thermostat is set to 72°F but the temperature is only reaching 65°F. Need heating repair before winter.',
        location: 'Unit 103 - Entire Unit',
        status: 'in_progress' as const,
        assignedTo: technician2Id,
        assignedAt: Date.now() - 1800000, // 30 minutes ago
        estimatedCost: 300,
        actualCost: undefined,
        estimatedCompletion: Date.now() + 172800000, // 2 days from now
        actualCompletion: undefined,
        photos: ['https://example.com/thermostat.jpg'],
        documents: ['https://example.com/hvac-manual.pdf'],
        tenantApproval: true,
        tenantApprovalAt: Date.now() - 1800000,
        createdAt: Date.now() - 3600000, // 1 hour ago
        updatedAt: Date.now() - 1800000,
      },
      {
        propertyId: property1Id,
        unitId: units[3],
        requestedBy: tenant1Id,
        requestType: 'appliance' as const,
        priority: 'low' as const,
        title: 'Dishwasher Not Draining',
        description:
          'The dishwasher completes its cycle but water remains in the bottom. The drain seems to be clogged or the pump is not working properly.',
        location: 'Unit 104 - Kitchen',
        status: 'completed' as const,
        assignedTo: technician1Id,
        assignedAt: Date.now() - 259200000, // 3 days ago
        estimatedCost: 120,
        actualCost: 95,
        estimatedCompletion: Date.now() - 172800000, // 2 days ago
        actualCompletion: Date.now() - 172800000,
        photos: ['https://example.com/dishwasher1.jpg', 'https://example.com/dishwasher2.jpg'],
        documents: [],
        tenantApproval: true,
        tenantApprovalAt: Date.now() - 259200000,
        createdAt: Date.now() - 302400000, // 3.5 days ago
        updatedAt: Date.now() - 172800000,
      },
      {
        propertyId: property1Id,
        unitId: units[4],
        requestedBy: tenant2Id,
        requestType: 'general' as const,
        priority: 'medium' as const,
        title: 'Broken Window Screen',
        description:
          'The window screen in the bedroom has a large tear and needs to be replaced. The tear is allowing insects to enter the room.',
        location: 'Unit 105 - Bedroom',
        status: 'pending' as const,
        assignedTo: undefined,
        assignedAt: undefined,
        estimatedCost: 80,
        actualCost: undefined,
        estimatedCompletion: undefined,
        actualCompletion: undefined,
        photos: ['https://example.com/screen1.jpg'],
        documents: [],
        tenantApproval: undefined,
        tenantApprovalAt: undefined,
        createdAt: Date.now() - 43200000, // 12 hours ago
        updatedAt: Date.now() - 43200000,
      },
      {
        propertyId: property1Id,
        unitId: units[5],
        requestedBy: tenant3Id,
        requestType: 'plumbing' as const,
        priority: 'high' as const,
        title: 'Toilet Constantly Running',
        description:
          'The toilet in the master bathroom runs continuously. The flapper valve seems to be stuck open, causing water to run constantly.',
        location: 'Unit 106 - Master Bathroom',
        status: 'assigned' as const,
        assignedTo: technician2Id,
        assignedAt: Date.now() - 900000, // 15 minutes ago
        estimatedCost: 100,
        actualCost: undefined,
        estimatedCompletion: Date.now() + 259200000, // 3 days from now
        actualCompletion: undefined,
        photos: ['https://example.com/toilet1.jpg'],
        documents: [],
        tenantApproval: true,
        tenantApprovalAt: Date.now() - 900000,
        createdAt: Date.now() - 1800000, // 30 minutes ago
        updatedAt: Date.now() - 900000,
      },
      {
        propertyId: property1Id,
        unitId: units[6],
        requestedBy: tenant1Id,
        requestType: 'electrical' as const,
        priority: 'medium' as const,
        title: 'Flickering Light in Hallway',
        description:
          'The overhead light in the hallway flickers intermittently. Sometimes it works fine, other times it flickers or goes out completely.',
        location: 'Unit 107 - Hallway',
        status: 'completed' as const,
        assignedTo: technician1Id,
        assignedAt: Date.now() - 604800000, // 7 days ago
        estimatedCost: 75,
        actualCost: 60,
        estimatedCompletion: Date.now() - 432000000, // 5 days ago
        actualCompletion: Date.now() - 432000000,
        photos: ['https://example.com/light1.jpg'],
        documents: [],
        tenantApproval: true,
        tenantApprovalAt: Date.now() - 604800000,
        createdAt: Date.now() - 691200000, // 8 days ago
        updatedAt: Date.now() - 432000000,
      },
      {
        propertyId: property1Id,
        unitId: units[7],
        requestedBy: tenant2Id,
        requestType: 'hvac' as const,
        priority: 'low' as const,
        title: 'AC Filter Replacement',
        description:
          "The AC filter needs to be replaced. It's been 3 months since the last replacement and the air quality is starting to decline.",
        location: 'Unit 108 - HVAC System',
        status: 'cancelled' as const,
        assignedTo: undefined,
        assignedAt: undefined,
        estimatedCost: 25,
        actualCost: undefined,
        estimatedCompletion: undefined,
        actualCompletion: undefined,
        photos: [],
        documents: [],
        tenantApproval: undefined,
        tenantApprovalAt: undefined,
        createdAt: Date.now() - 1209600000, // 14 days ago
        updatedAt: Date.now() - 1209600000,
      },
      {
        propertyId: property1Id,
        unitId: units[8],
        requestedBy: tenant3Id,
        requestType: 'appliance' as const,
        priority: 'high' as const,
        title: 'Washing Machine Not Spinning',
        description:
          "The washing machine fills with water and agitates, but it doesn't spin to drain the water. Clothes come out soaking wet.",
        location: 'Unit 109 - Laundry Room',
        status: 'in_progress' as const,
        assignedTo: technician1Id,
        assignedAt: Date.now() - 2700000, // 45 minutes ago
        estimatedCost: 180,
        actualCost: undefined,
        estimatedCompletion: Date.now() + 345600000, // 4 days from now
        actualCompletion: undefined,
        photos: ['https://example.com/washer1.jpg', 'https://example.com/washer2.jpg'],
        documents: ['https://example.com/washer-manual.pdf'],
        tenantApproval: true,
        tenantApprovalAt: Date.now() - 2700000,
        createdAt: Date.now() - 3600000, // 1 hour ago
        updatedAt: Date.now() - 2700000,
      },
      {
        propertyId: property1Id,
        unitId: units[9],
        requestedBy: tenant1Id,
        requestType: 'general' as const,
        priority: 'low' as const,
        title: 'Loose Cabinet Door',
        description:
          "The cabinet door under the kitchen sink is loose and doesn't close properly. The hinge needs to be tightened or replaced.",
        location: 'Unit 110 - Kitchen',
        status: 'pending' as const,
        assignedTo: undefined,
        assignedAt: undefined,
        estimatedCost: 40,
        actualCost: undefined,
        estimatedCompletion: undefined,
        actualCompletion: undefined,
        photos: ['https://example.com/cabinet1.jpg'],
        documents: [],
        tenantApproval: undefined,
        tenantApprovalAt: undefined,
        createdAt: Date.now() - 7200000, // 2 hours ago
        updatedAt: Date.now() - 7200000,
      },
    ];

    const maintenanceRequestIds = [];
    for (const request of maintenanceRequests) {
      const id = await ctx.db.insert('maintenanceRequests', request);
      maintenanceRequestIds.push(id);
    }

    // Seed notices, events, and polls
    const noticeResults: {
      notices: number;
      events: number;
      polls: number;
      acknowledgments: number;
    } = await ctx.runMutation(api.seeders.notice.seedNotices);

    return {
      properties: 2,
      units: 10,
      users: 6, // 1 manager + 3 tenants + 2 technicians
      maintenanceRequests: 10,
      notices: noticeResults.notices,
      events: noticeResults.events,
      polls: noticeResults.polls,
      acknowledgments: noticeResults.acknowledgments,
    };
  },
});
