import { Id } from '../_generated/dataModel';
import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const seedVisitorLogs = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    // Get existing data
    const visitorRequests = await ctx.db.query('visitorRequests').collect();
    const users = await ctx.db.query('users').collect();

    if (visitorRequests.length === 0 || users.length === 0) {
      throw new Error('Required data (visitorRequests, users) not found. Please run visitor requests seeder first.');
    }

    const manager = users.find(u => u.role === 'manager');
    const securityGuard = users.find(u => u.role === 'field_technician'); // Using technician as security guard for demo

    if (!manager) {
      throw new Error('Manager not found. Please run main seeder first.');
    }

    // Get approved visitor requests for creating logs
    const approvedRequests = visitorRequests.filter(req => req.status === 'approved');
    
    if (approvedRequests.length === 0) {
      throw new Error('No approved visitor requests found. Please run visitor requests seeder first.');
    }

    const visitorLogs = [
      // Check-in logs for approved requests
      {
        visitorRequestId: approvedRequests[0]._id,
        propertyId: approvedRequests[0].propertyId,
        unitId: approvedRequests[0].unitId,
        visitorName: approvedRequests[0].visitorName,
        action: 'check_in' as const,
        timestamp: Date.now() - 1800000, // 30 minutes ago
        location: 'Main Entrance - Security Desk',
        verifiedBy: securityGuard?._id || manager._id,
        notes: 'Visitor arrived on time with valid ID. Temperature check completed.',
        blockchainTxHash: '0xcheckin1234567890abcdef1234567890abcdef12',
        blockNumber: 12345678,
        smartContractAddress: '0xVisitorContract1234567890abcdef1234567890',
        createdAt: Date.now() - 1800000,
      },
      {
        visitorRequestId: approvedRequests[1]._id,
        propertyId: approvedRequests[1].propertyId,
        unitId: approvedRequests[1].unitId,
        visitorName: approvedRequests[1].visitorName,
        action: 'check_in' as const,
        timestamp: Date.now() - 900000, // 15 minutes ago
        location: 'Side Entrance - Gate 2',
        verifiedBy: manager._id,
        notes: 'Business visitor with appointment. Escorted to unit.',
        blockchainTxHash: '0xcheckin234567890abcdef1234567890abcdef1234',
        blockNumber: 12345679,
        smartContractAddress: '0xVisitorContract1234567890abcdef1234567890',
        createdAt: Date.now() - 900000,
      },
      // Check-out logs
      {
        visitorRequestId: approvedRequests[0]._id,
        propertyId: approvedRequests[0].propertyId,
        unitId: approvedRequests[0].unitId,
        visitorName: approvedRequests[0].visitorName,
        action: 'check_out' as const,
        timestamp: Date.now() - 300000, // 5 minutes ago
        location: 'Main Entrance - Security Desk',
        verifiedBy: securityGuard?._id || manager._id,
        notes: 'Visitor departed safely. Visit completed successfully.',
        blockchainTxHash: '0xcheckout1234567890abcdef1234567890abcdef12',
        blockNumber: 12345680,
        smartContractAddress: '0xVisitorContract1234567890abcdef1234567890',
        createdAt: Date.now() - 300000,
      },
      // No-show logs for some requests
      {
        visitorRequestId: approvedRequests[1]._id,
        propertyId: approvedRequests[1].propertyId,
        unitId: approvedRequests[1].unitId,
        visitorName: approvedRequests[1].visitorName,
        action: 'no_show' as const,
        timestamp: Date.now() - 600000, // 10 minutes ago
        location: 'Main Entrance - Security Desk',
        verifiedBy: manager._id,
        notes: 'Visitor did not arrive within expected time window. Attempted contact - no response.',
        blockchainTxHash: '0xnoshow1234567890abcdef1234567890abcdef12',
        blockNumber: 12345681,
        smartContractAddress: '0xVisitorContract1234567890abcdef1234567890',
        createdAt: Date.now() - 600000,
      },
    ];

    // Add more logs for historical data
    const historicalLogs = [
      // Yesterday's logs
      {
        visitorRequestId: approvedRequests[0]._id,
        propertyId: approvedRequests[0].propertyId,
        unitId: approvedRequests[0].unitId,
        visitorName: 'Previous Visitor 1',
        action: 'check_in' as const,
        timestamp: Date.now() - 86400000, // 1 day ago
        location: 'Main Entrance - Security Desk',
        verifiedBy: manager._id,
        notes: 'Regular visitor for maintenance work.',
        blockchainTxHash: '0xhistorical1234567890abcdef1234567890abcdef',
        blockNumber: 12345670,
        smartContractAddress: '0xVisitorContract1234567890abcdef1234567890',
        createdAt: Date.now() - 86400000,
      },
      {
        visitorRequestId: approvedRequests[0]._id,
        propertyId: approvedRequests[0].propertyId,
        unitId: approvedRequests[0].unitId,
        visitorName: 'Previous Visitor 1',
        action: 'check_out' as const,
        timestamp: Date.now() - 82800000, // 23 hours ago
        location: 'Main Entrance - Security Desk',
        verifiedBy: manager._id,
        notes: 'Maintenance work completed successfully.',
        blockchainTxHash: '0xhistorical234567890abcdef1234567890abcdef1',
        blockNumber: 12345671,
        smartContractAddress: '0xVisitorContract1234567890abcdef1234567890',
        createdAt: Date.now() - 82800000,
      },
      // Two days ago logs
      {
        visitorRequestId: approvedRequests[1]._id,
        propertyId: approvedRequests[1].propertyId,
        unitId: approvedRequests[1].unitId,
        visitorName: 'Previous Visitor 2',
        action: 'check_in' as const,
        timestamp: Date.now() - 172800000, // 2 days ago
        location: 'Side Entrance - Gate 1',
        verifiedBy: securityGuard?._id || manager._id,
        notes: 'Delivery service visit.',
        blockchainTxHash: '0xhistorical34567890abcdef1234567890abcdef12',
        blockNumber: 12345660,
        smartContractAddress: '0xVisitorContract1234567890abcdef1234567890',
        createdAt: Date.now() - 172800000,
      },
      {
        visitorRequestId: approvedRequests[1]._id,
        propertyId: approvedRequests[1].propertyId,
        unitId: approvedRequests[1].unitId,
        visitorName: 'Previous Visitor 2',
        action: 'check_out' as const,
        timestamp: Date.now() - 169200000, // 1 day 23 hours ago
        location: 'Side Entrance - Gate 1',
        verifiedBy: securityGuard?._id || manager._id,
        notes: 'Package delivered successfully.',
        blockchainTxHash: '0xhistorical4567890abcdef1234567890abcdef123',
        blockNumber: 12345661,
        smartContractAddress: '0xVisitorContract1234567890abcdef1234567890',
        createdAt: Date.now() - 169200000,
      },
    ];

    const allLogs = [...visitorLogs, ...historicalLogs];
    const visitorLogIds = [];
    
    for (const log of allLogs) {
      const id = await ctx.db.insert('visitorLogs', log);
      visitorLogIds.push(id);
    }

    return visitorLogIds.length;
  },
});
