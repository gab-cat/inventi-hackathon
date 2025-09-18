import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { Id } from '../_generated/dataModel';

export const seedAssets = mutation({
  args: {},
  returns: v.object({
    assets: v.number(),
    assetHistory: v.number(),
  }),
  handler: async ctx => {
    // Check if assets already exist
    const existingAssets = await ctx.db.query('assets').collect();
    if (existingAssets.length > 0) {
      return {
        assets: existingAssets.length,
        assetHistory: (await ctx.db.query('assetHistory').collect()).length,
      };
    }

    // Get existing data to reference
    const users = await ctx.db.query('users').collect();
    const properties = await ctx.db.query('properties').collect();

    if (users.length === 0 || properties.length === 0) {
      throw new Error('No users or properties found. Please run the main seed first.');
    }

    // Get field technicians and managers
    const fieldTechnicians = users.filter(u => u.role === 'field_technician');
    const managers = users.filter(u => u.role === 'manager');

    if (fieldTechnicians.length === 0) {
      throw new Error('No field technicians found. Please run the main seed first.');
    }

    const property = properties[0]; // Use the first property for now

    // Create comprehensive asset inventory
    const assets = [
      // Tools
      {
        propertyId: property._id,
        assetTag: 'TOOL-001',
        name: 'Cordless Drill Set',
        description: '18V cordless drill with various bits and charger',
        category: 'tool',
        subcategory: 'power_tool',
        brand: 'DeWalt',
        model: 'DCD791D2',
        serialNumber: 'DW00123456',
        purchaseDate: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago
        purchasePrice: 299.99,
        currentValue: 250.0,
        condition: 'excellent',
        status: 'available',
        location: 'Maintenance Shop - Tool Cabinet A',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: {
          interval: 90 * 24 * 60 * 60 * 1000, // 90 days
          lastMaintenance: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
          nextMaintenance: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
        },
        warrantyExpiry: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
        photos: ['https://example.com/drill1.jpg', 'https://example.com/drill2.jpg'],
        documents: ['https://example.com/drill-manual.pdf'],
        createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },
      {
        propertyId: property._id,
        assetTag: 'TOOL-002',
        name: 'Pipe Wrench Set',
        description: 'Adjustable pipe wrenches in various sizes (12", 18", 24")',
        category: 'tool',
        subcategory: 'hand_tool',
        brand: 'Ridgid',
        model: '31020',
        serialNumber: 'RG00789012',
        purchaseDate: Date.now() - 730 * 24 * 60 * 60 * 1000, // 2 years ago
        purchasePrice: 149.99,
        currentValue: 120.0,
        condition: 'good',
        status: 'available',
        location: 'Maintenance Shop - Tool Cabinet B',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: undefined, // No regular maintenance needed
        warrantyExpiry: undefined,
        photos: ['https://example.com/wrench1.jpg'],
        documents: [],
        createdAt: Date.now() - 730 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
      },
      {
        propertyId: property._id,
        assetTag: 'TOOL-003',
        name: 'Multimeter',
        description: 'Digital multimeter for electrical testing',
        category: 'tool',
        subcategory: 'electrical_tool',
        brand: 'Fluke',
        model: '87V',
        serialNumber: 'FL00345678',
        purchaseDate: Date.now() - 180 * 24 * 60 * 60 * 1000, // 6 months ago
        purchasePrice: 499.99,
        currentValue: 480.0,
        condition: 'excellent',
        status: 'checked_out',
        location: 'Unit 102',
        assignedTo: fieldTechnicians[0]._id,
        assignedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        maintenanceSchedule: {
          interval: 365 * 24 * 60 * 60 * 1000, // 1 year
          lastMaintenance: Date.now() - 180 * 24 * 60 * 60 * 1000, // 6 months ago
          nextMaintenance: Date.now() + 180 * 24 * 60 * 60 * 1000, // 6 months from now
        },
        warrantyExpiry: Date.now() + 2 * 365 * 24 * 60 * 60 * 1000, // 2 years from now
        photos: ['https://example.com/multimeter1.jpg'],
        documents: ['https://example.com/multimeter-manual.pdf'],
        createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 2 * 60 * 60 * 1000,
      },
      {
        propertyId: property._id,
        assetTag: 'TOOL-004',
        name: 'Plunger Set',
        description: 'Professional plumbing plungers for toilet and sink',
        category: 'tool',
        subcategory: 'plumbing_tool',
        brand: 'Ridgid',
        model: '59787',
        serialNumber: 'RG00987654',
        purchaseDate: Date.now() - 90 * 24 * 60 * 60 * 1000, // 3 months ago
        purchasePrice: 79.99,
        currentValue: 75.0,
        condition: 'excellent',
        status: 'available',
        location: 'Maintenance Shop - Plumbing Section',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: undefined,
        warrantyExpiry: undefined,
        photos: [],
        documents: [],
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },
      {
        propertyId: property._id,
        assetTag: 'TOOL-005',
        name: 'Ladder Extension 32ft',
        description: '32-foot extension ladder for high-access work',
        category: 'tool',
        subcategory: 'access_tool',
        brand: 'Little Giant',
        model: 'Velocity 32',
        serialNumber: 'LG00567890',
        purchaseDate: Date.now() - 545 * 24 * 60 * 60 * 1000, // 1.5 years ago
        purchasePrice: 899.99,
        currentValue: 750.0,
        condition: 'good',
        status: 'available',
        location: 'Maintenance Shop - Equipment Storage',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: {
          interval: 180 * 24 * 60 * 60 * 1000, // 6 months
          lastMaintenance: Date.now() - 120 * 24 * 60 * 60 * 1000, // 4 months ago
          nextMaintenance: Date.now() + 60 * 24 * 60 * 60 * 1000, // 2 months from now
        },
        warrantyExpiry: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
        photos: ['https://example.com/ladder1.jpg', 'https://example.com/ladder2.jpg'],
        documents: ['https://example.com/ladder-manual.pdf'],
        createdAt: Date.now() - 545 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },

      // Equipment
      {
        propertyId: property._id,
        assetTag: 'EQUIP-001',
        name: 'HVAC Diagnostic Tool',
        description: 'Professional HVAC manifold gauge set with digital display',
        category: 'equipment',
        subcategory: 'hvac_equipment',
        brand: 'Yellow Jacket',
        model: '49973',
        serialNumber: 'YJ00111222',
        purchaseDate: Date.now() - 300 * 24 * 60 * 60 * 1000, // ~10 months ago
        purchasePrice: 599.99,
        currentValue: 550.0,
        condition: 'excellent',
        status: 'available',
        location: 'Maintenance Shop - HVAC Station',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: {
          interval: 365 * 24 * 60 * 60 * 1000, // Annual calibration
          lastMaintenance: Date.now() - 300 * 24 * 60 * 60 * 1000, // 10 months ago
          nextMaintenance: Date.now() + 65 * 24 * 60 * 60 * 1000, // ~2 months from now
        },
        warrantyExpiry: Date.now() + 2 * 365 * 24 * 60 * 60 * 1000, // 2 years from now
        photos: ['https://example.com/hvac-gauge1.jpg'],
        documents: ['https://example.com/hvac-gauge-manual.pdf'],
        createdAt: Date.now() - 300 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },
      {
        propertyId: property._id,
        assetTag: 'EQUIP-002',
        name: 'Generator 5000W',
        description: 'Portable gasoline generator for backup power',
        category: 'equipment',
        subcategory: 'power_equipment',
        brand: 'Honda',
        model: 'EU3000iS',
        serialNumber: 'HN00233445',
        purchaseDate: Date.now() - 2 * 365 * 24 * 60 * 60 * 1000, // 2 years ago
        purchasePrice: 2499.99,
        currentValue: 2000.0,
        condition: 'good',
        status: 'available',
        location: 'Maintenance Shop - Generator Bay',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: {
          interval: 180 * 24 * 60 * 60 * 1000, // 6 months
          lastMaintenance: Date.now() - 90 * 24 * 60 * 60 * 1000, // 3 months ago
          nextMaintenance: Date.now() + 90 * 24 * 60 * 60 * 1000, // 3 months from now
        },
        warrantyExpiry: Date.now() + 3 * 365 * 24 * 60 * 60 * 1000, // 3 years from now
        photos: ['https://example.com/generator1.jpg', 'https://example.com/generator2.jpg'],
        documents: ['https://example.com/generator-manual.pdf'],
        createdAt: Date.now() - 2 * 365 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },

      // Materials
      {
        propertyId: property._id,
        assetTag: 'MAT-001',
        name: 'PVC Pipe Assortment',
        description: 'Various sizes of PVC pipe for plumbing repairs (1/2", 3/4", 1", 1-1/2", 2")',
        category: 'material',
        subcategory: 'plumbing_supplies',
        brand: 'Charlotte Pipe',
        model: 'PVC Schedule 40',
        serialNumber: undefined,
        purchaseDate: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
        purchasePrice: 299.99,
        currentValue: 250.0,
        condition: 'excellent',
        status: 'available',
        location: 'Maintenance Shop - Plumbing Materials',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: undefined,
        warrantyExpiry: undefined,
        photos: ['https://example.com/pvc-pipe.jpg'],
        documents: [],
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
      {
        propertyId: property._id,
        assetTag: 'MAT-002',
        name: 'Electrical Wire Spools',
        description: '14-gauge and 12-gauge electrical wire spools (50ft each)',
        category: 'material',
        subcategory: 'electrical_supplies',
        brand: 'Southwire',
        model: 'Romex NM-B',
        serialNumber: undefined,
        purchaseDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        purchasePrice: 149.99,
        currentValue: 140.0,
        condition: 'excellent',
        status: 'available',
        location: 'Maintenance Shop - Electrical Materials',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: undefined,
        warrantyExpiry: undefined,
        photos: [],
        documents: [],
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },

      // Furniture
      {
        propertyId: property._id,
        assetTag: 'FURN-001',
        name: 'Office Chair',
        description: 'Ergonomic office chair for maintenance office',
        category: 'furniture',
        subcategory: 'office_furniture',
        brand: 'Herman Miller',
        model: 'Aeron',
        serialNumber: 'HM00155677',
        purchaseDate: Date.now() - 3 * 365 * 24 * 60 * 60 * 1000, // 3 years ago
        purchasePrice: 1299.99,
        currentValue: 800.0,
        condition: 'fair',
        status: 'available',
        location: 'Maintenance Office',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: undefined,
        warrantyExpiry: undefined,
        photos: ['https://example.com/office-chair.jpg'],
        documents: [],
        createdAt: Date.now() - 3 * 365 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
      },

      // Appliances
      {
        propertyId: property._id,
        assetTag: 'APPL-001',
        name: 'Refrigerator Test Unit',
        description: 'Commercial refrigerator for testing and repairs',
        category: 'appliance',
        subcategory: 'refrigeration',
        brand: 'True Manufacturing',
        model: 'T-23',
        serialNumber: 'TM00234567',
        purchaseDate: Date.now() - 4 * 365 * 24 * 60 * 60 * 1000, // 4 years ago
        purchasePrice: 2999.99,
        currentValue: 1800.0,
        condition: 'good',
        status: 'maintenance',
        location: 'Maintenance Shop - Appliance Bay',
        assignedTo: undefined,
        assignedAt: undefined,
        maintenanceSchedule: {
          interval: 90 * 24 * 60 * 60 * 1000, // 3 months
          lastMaintenance: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
          nextMaintenance: Date.now() + 45 * 24 * 60 * 60 * 1000, // 45 days from now
        },
        warrantyExpiry: undefined,
        photos: ['https://example.com/ref-test-unit.jpg'],
        documents: ['https://example.com/ref-manual.pdf'],
        createdAt: Date.now() - 4 * 365 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      },
    ];

    // Insert assets and collect their IDs
    const assetIds: Id<'assets'>[] = [];
    for (const asset of assets) {
      const assetId = await ctx.db.insert('assets', asset);
      assetIds.push(assetId);
    }

    // Create asset history entries
    const assetHistory = [
      // Cordless Drill history
      {
        assetId: assetIds[0],
        propertyId: property._id,
        action: 'check_out',
        fromUser: undefined,
        toUser: fieldTechnicians[0]._id,
        fromLocation: 'Maintenance Shop - Tool Cabinet A',
        toLocation: 'Unit 101',
        notes: 'Checked out for plumbing repair work',
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        performedBy: fieldTechnicians[0]._id,
      },
      {
        assetId: assetIds[0],
        propertyId: property._id,
        action: 'check_in',
        fromUser: fieldTechnicians[0]._id,
        toUser: undefined,
        fromLocation: 'Unit 101',
        toLocation: 'Maintenance Shop - Tool Cabinet A',
        notes: 'Returned after completing plumbing repair',
        timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
        performedBy: fieldTechnicians[0]._id,
      },
      {
        assetId: assetIds[0],
        propertyId: property._id,
        action: 'maintenance',
        fromUser: undefined,
        toUser: undefined,
        fromLocation: 'Maintenance Shop - Tool Cabinet A',
        toLocation: 'Maintenance Shop - Tool Cabinet A',
        notes: 'Routine maintenance - battery replaced, calibration performed',
        timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        performedBy: managers[0]._id,
      },

      // Multimeter history (currently checked out)
      {
        assetId: assetIds[2],
        propertyId: property._id,
        action: 'check_out',
        fromUser: undefined,
        toUser: fieldTechnicians[0]._id,
        fromLocation: 'Maintenance Shop - Electrical Section',
        toLocation: 'Unit 102',
        notes: 'Checked out to investigate electrical issue',
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        performedBy: fieldTechnicians[0]._id,
      },

      // Generator history
      {
        assetId: assetIds[6],
        propertyId: property._id,
        action: 'check_out',
        fromUser: undefined,
        toUser: fieldTechnicians[1]._id,
        fromLocation: 'Maintenance Shop - Generator Bay',
        toLocation: 'Parking Lot',
        notes: 'Emergency power needed for building maintenance',
        timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
        performedBy: fieldTechnicians[1]._id,
      },
      {
        assetId: assetIds[6],
        propertyId: property._id,
        action: 'check_in',
        fromUser: fieldTechnicians[1]._id,
        toUser: undefined,
        fromLocation: 'Parking Lot',
        toLocation: 'Maintenance Shop - Generator Bay',
        notes: 'Power restored, generator returned',
        timestamp: Date.now() - 13 * 24 * 60 * 60 * 1000, // 13 days ago
        performedBy: fieldTechnicians[1]._id,
      },
      {
        assetId: assetIds[6],
        propertyId: property._id,
        action: 'maintenance',
        fromUser: undefined,
        toUser: undefined,
        fromLocation: 'Maintenance Shop - Generator Bay',
        toLocation: 'Maintenance Shop - Generator Bay',
        notes: 'Quarterly maintenance - oil change, filter replacement, test run performed',
        timestamp: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
        performedBy: fieldTechnicians[1]._id,
      },

      // PVC Pipe usage history
      {
        assetId: assetIds[8],
        propertyId: property._id,
        action: 'transfer',
        fromUser: undefined,
        toUser: fieldTechnicians[0]._id,
        fromLocation: 'Maintenance Shop - Plumbing Materials',
        toLocation: 'Unit 103',
        notes: 'Materials transferred for bathroom repair project',
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        performedBy: fieldTechnicians[0]._id,
      },
      {
        assetId: assetIds[8],
        propertyId: property._id,
        action: 'transfer',
        fromUser: fieldTechnicians[0]._id,
        toUser: undefined,
        fromLocation: 'Unit 103',
        toLocation: 'Maintenance Shop - Plumbing Materials',
        notes: 'Remaining materials returned to inventory',
        timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
        performedBy: fieldTechnicians[0]._id,
      },

      // Office Chair history
      {
        assetId: assetIds[10],
        propertyId: property._id,
        action: 'retire',
        fromUser: undefined,
        toUser: undefined,
        fromLocation: 'Maintenance Office',
        toLocation: 'Storage - Retired Assets',
        notes: 'Chair showing wear and tear, replaced with new model',
        timestamp: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
        performedBy: managers[0]._id,
      },

      // Refrigerator test unit maintenance
      {
        assetId: assetIds[10],
        propertyId: property._id,
        action: 'maintenance',
        fromUser: undefined,
        toUser: undefined,
        fromLocation: 'Maintenance Shop - Appliance Bay',
        toLocation: 'Maintenance Shop - Appliance Bay',
        notes: 'Scheduled maintenance - condenser coils cleaned, temperature calibration performed',
        timestamp: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
        performedBy: fieldTechnicians[1]._id,
      },
    ];

    // Insert asset history
    const historyIds: string[] = [];
    for (const history of assetHistory) {
      const historyId = await ctx.db.insert('assetHistory', history);
      historyIds.push(historyId);
    }

    return {
      assets: assetIds.length,
      assetHistory: historyIds.length,
    };
  },
});
