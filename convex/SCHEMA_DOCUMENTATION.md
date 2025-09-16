# Property Management System - Convex Schema Documentation

## Overview

This comprehensive schema supports a full-featured property management system with blockchain integration, IoT device monitoring, and multi-role access control. The schema is designed to handle all the features mentioned in the requirements while maintaining data integrity, performance, and scalability.

## Core Design Principles

### 1. **Multi-Role Architecture**
- Users can have multiple roles across different properties
- Role-based access control (RBAC) with granular permissions
- Support for managers, tenants, vendors, and field technicians

### 2. **Blockchain Integration**
- Immutable audit trails for critical operations
- Tamper-proof visitor logs, delivery confirmations, and payment receipts
- Smart contract integration for automated processes

### 3. **Real-time IoT Monitoring**
- Support for water meters, electricity meters, and other IoT devices
- Anomaly detection and alerting
- Historical data tracking for analytics

### 4. **Comprehensive Asset Management**
- Barcode/RFID/QR code tracking
- Check-in/check-out workflows
- Maintenance scheduling and condition monitoring

## Schema Structure

### Core Tables

#### `users`
- **Purpose**: Central user management with Clerk authentication
- **Key Features**: Multi-role support, profile management, activity tracking
- **Edge Cases**: Role changes, user deactivation, multi-property access

#### `properties`
- **Purpose**: Property information and configuration
- **Key Features**: Manager assignment, property-specific settings, visitor/delivery limits
- **Edge Cases**: Property transfers, setting updates, inactive properties

#### `units`
- **Purpose**: Individual units within properties
- **Key Features**: Tenant assignment, occupancy tracking, unit-specific data
- **Edge Cases**: Unit transfers, temporary occupancy, unit modifications

#### `userProperties`
- **Purpose**: Many-to-many relationship between users and properties
- **Key Features**: Role-based access, permission management, assignment tracking
- **Edge Cases**: Role changes, property transfers, permission revocation

### Visitor Management

#### `visitorRequests`
- **Purpose**: Visitor pass requests and approvals
- **Key Features**: Document uploads, approval workflows, blockchain integration
- **Edge Cases**: 
  - No-show visitors
  - Expired passes
  - Security alerts
  - Document verification failures
  - Visitor limit enforcement

#### `visitorLogs`
- **Purpose**: Immutable check-in/out records
- **Key Features**: Blockchain integration, location tracking, verification
- **Edge Cases**:
  - Failed blockchain transactions
  - Network connectivity issues
  - Verification failures
  - Duplicate check-ins

#### `watchlist`
- **Purpose**: Security watchlist management
- **Key Features**: Risk level classification, active/inactive status
- **Edge Cases**: False positives, risk level updates, watchlist conflicts

### Delivery Management

#### `deliveries`
- **Purpose**: Package and delivery tracking
- **Key Features**: Status tracking, photo documentation, blockchain integration
- **Edge Cases**:
  - Failed deliveries
  - Wrong recipients
  - Package damage
  - Delivery disputes
  - Returned packages

#### `deliveryLogs`
- **Purpose**: Delivery audit trail
- **Key Features**: Action tracking, blockchain integration, timestamp verification
- **Edge Cases**: Log inconsistencies, blockchain sync failures

### Payment System

#### `invoices`
- **Purpose**: Billing and invoice management
- **Key Features**: Multiple invoice types, late fees, payment tracking
- **Edge Cases**:
  - Partial payments
  - Payment disputes
  - Refund processing
  - Failed transactions
  - Currency conversion

#### `payments`
- **Purpose**: Payment processing and tracking
- **Key Features**: Multiple payment methods, status tracking, blockchain integration
- **Edge Cases**: Payment failures, chargebacks, refunds, currency issues

#### `receipts`
- **Purpose**: Blockchain-based receipt NFTs
- **Key Features**: NFT integration, metadata storage, verification
- **Edge Cases**: NFT minting failures, metadata corruption, verification issues

### Maintenance System

#### `maintenanceRequests`
- **Purpose**: Maintenance request management
- **Key Features**: Priority levels, assignment tracking, cost management
- **Edge Cases**:
  - Emergency requests
  - Vendor unavailability
  - Cost overruns
  - Tenant approval delays
  - Recurring issues

#### `maintenanceUpdates`
- **Purpose**: Status updates and progress tracking
- **Key Features**: Photo documentation, timestamp tracking, user attribution
- **Edge Cases**: Update conflicts, photo upload failures, status inconsistencies

### Communication System

#### `notices`
- **Purpose**: Property-wide announcements and notices
- **Key Features**: Targeted delivery, scheduling, priority levels
- **Edge Cases**:
  - Delivery failures
  - Scheduling conflicts
  - Content moderation
  - Expired notices

#### `noticeAcknowledgments`
- **Purpose**: Notice read receipts
- **Key Features**: User tracking, timestamp verification
- **Edge Cases**: Duplicate acknowledgments, acknowledgment failures

#### `events`
- **Purpose**: Calendar and event management
- **Key Features**: Recurring events, attendee management, location tracking
- **Edge Cases**:
  - Event conflicts
  - Capacity limits
  - Cancellation handling
  - Recurring pattern changes

#### `polls`
- **Purpose**: Community polls and surveys
- **Key Features**: Multiple question types, anonymous responses, expiration
- **Edge Cases**:
  - Duplicate responses
  - Expired polls
  - Response validation
  - Result calculation errors

### Chat System

#### `chatThreads`
- **Purpose**: Communication threads
- **Key Features**: Individual/group chats, assignment tracking, archiving
- **Edge Cases**:
  - Message delivery failures
  - Thread assignment conflicts
  - Archive/restore issues
  - Participant management

#### `messages`
- **Purpose**: Individual chat messages
- **Key Features**: File attachments, read receipts, message editing
- **Edge Cases**:
  - Message delivery failures
  - File upload issues
  - Read receipt inconsistencies
  - Message deletion conflicts

### Asset Management

#### `assets`
- **Purpose**: Inventory and equipment tracking
- **Key Features**: Barcode scanning, condition monitoring, maintenance scheduling
- **Edge Cases**:
  - Lost assets
  - Damage reports
  - Maintenance overdue
  - Assignment conflicts
  - Barcode duplication

#### `assetHistory`
- **Purpose**: Asset movement and usage tracking
- **Key Features**: Check-in/out logging, transfer tracking, audit trail
- **Edge Cases**:
  - History inconsistencies
  - Transfer failures
  - Check-in/out conflicts
  - Audit trail gaps

### IoT Integration

#### `iotDevices`
- **Purpose**: IoT device management
- **Key Features**: Device configuration, alert thresholds, status monitoring
- **Edge Cases**:
  - Device failures
  - Configuration errors
  - Network connectivity issues
  - Device replacement

#### `iotReadings`
- **Purpose**: IoT sensor data storage
- **Key Features**: Real-time data, anomaly detection, historical tracking
- **Edge Cases**:
  - Data corruption
  - Anomaly false positives
  - Network timeouts
  - Device calibration issues

### System Tables

#### `auditLogs`
- **Purpose**: System-wide audit trail
- **Key Features**: Action tracking, data change logging, security monitoring
- **Edge Cases**:
  - Log truncation
  - Performance impact
  - Log integrity
  - Storage limits

#### `systemSettings`
- **Purpose**: Configuration management
- **Key Features**: Property-specific settings, global configuration, type safety
- **Edge Cases**:
  - Setting conflicts
  - Type mismatches
  - Permission issues
  - Default value handling

#### `notifications`
- **Purpose**: Push notification management
- **Key Features**: Targeted delivery, read tracking, deep linking
- **Edge Cases**:
  - Delivery failures
  - Duplicate notifications
  - Read receipt issues
  - Deep link failures

#### `fileUploads`
- **Purpose**: File storage and management
- **Key Features**: File type validation, size limits, expiration handling
- **Edge Cases**:
  - File corruption
  - Upload failures
  - Size limit violations
  - Expiration handling

## Indexing Strategy

### Performance Optimization
- **Composite indexes** for common query patterns
- **Timestamp indexes** for time-based queries
- **Status indexes** for filtering by state
- **Property-based indexes** for multi-tenant isolation

### Query Patterns Supported
- User role-based queries
- Property-specific data retrieval
- Time-range filtering
- Status-based filtering
- Search and pagination

## Blockchain Integration

### Supported Operations
1. **Visitor Logs**: Immutable check-in/out records
2. **Delivery Confirmations**: Tamper-proof delivery logs
3. **Payment Receipts**: Verifiable transaction records
4. **Asset Transfers**: Ownership and movement tracking

### Error Handling
- Transaction failure recovery
- Network connectivity issues
- Smart contract errors
- Data synchronization problems

## Security Considerations

### Data Protection
- Row-level security based on user roles
- Sensitive data encryption
- Audit trail for all modifications
- Blockchain verification for critical data

### Access Control
- Role-based permissions
- Property-level isolation
- API rate limiting
- Input validation and sanitization

## Scalability Features

### Performance
- Efficient indexing strategy
- Pagination support
- Query optimization
- Caching considerations

### Multi-tenancy
- Property-based data isolation
- User role management
- Resource allocation
- Performance monitoring

## Edge Case Handling

### Data Integrity
- Foreign key constraints
- Validation rules
- Transaction handling
- Rollback mechanisms

### Error Recovery
- Failed operation retry
- Data consistency checks
- Backup and restore
- Disaster recovery

## API Support

The schema supports all the mobile and web APIs mentioned in the requirements:

### Mobile APIs
- Visitor management (requestVisitorPass, getMyVisitors, etc.)
- Delivery tracking (notifyIncomingDelivery, getMyDeliveries, etc.)
- Payment processing (payInvoice, getMyReceipts, etc.)
- Maintenance requests (createRequest, getRequestStatus, etc.)
- Noticeboard (getNotices, acknowledgeNotice, etc.)
- Chat (startChatWithManager, sendMessage, etc.)
- Asset management (getInventoryList, checkOutAsset, etc.)

### Web APIs
- Visitor management (createVisitorEntry, getVisitorLog, etc.)
- Delivery management (registerDelivery, getDeliveryLog, etc.)
- Payment management (createInvoice, sendPaymentRequest, etc.)
- Maintenance management (getRequests, assignRequestToEmployee, etc.)
- Noticeboard management (createNotice, sendNoticeToAll, etc.)
- Chat management (getAllChatThreads, moderateChat, etc.)
- Asset management (editAssetDetails, addAsset, etc.)
- IoT webhooks (POST /webhooks/water-meter, POST /webhooks/electricity-meter)

## Implementation Notes

### Development Considerations
- Use Convex functions for business logic
- Implement proper error handling
- Add comprehensive logging
- Test all edge cases

### Deployment Considerations
- Monitor performance metrics
- Set up alerting for critical issues
- Implement backup strategies
- Plan for scaling

### Maintenance Considerations
- Regular schema updates
- Performance monitoring
- Security audits
- Data cleanup procedures

This schema provides a robust foundation for a comprehensive property management system that can handle all the specified requirements while maintaining data integrity, performance, and scalability.
