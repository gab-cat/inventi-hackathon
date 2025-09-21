import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ==================== CORE TABLES ====================

  // Users table with multi-role support
  users: defineTable({
    clerkId: v.string(), // Clerk authentication ID
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    role: v.union(v.literal('manager'), v.literal('tenant'), v.literal('vendor'), v.literal('field_technician')),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email'])
    .index('by_role', ['role'])
    .index('by_active', ['isActive']),

  // Properties and units
  properties: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.string(),
    propertyType: v.union(v.literal('apartment'), v.literal('condo'), v.literal('house'), v.literal('commercial')),
    totalUnits: v.number(),
    managerId: v.id('users'), // Primary manager
    isActive: v.boolean(),
    settings: v.optional(
      v.object({
        visitorLimitPerUnit: v.optional(v.number()),
        deliveryHours: v.optional(
          v.object({
            start: v.string(),
            end: v.string(),
          })
        ),
        maintenanceHours: v.optional(
          v.object({
            start: v.string(),
            end: v.string(),
          })
        ),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_manager', ['managerId'])
    .index('by_active', ['isActive'])
    .index('by_city', ['city']),

  // Units within properties
  units: defineTable({
    propertyId: v.id('properties'),
    unitNumber: v.string(),
    unitType: v.union(
      v.literal('apartment'),
      v.literal('office'),
      v.literal('retail'),
      v.literal('storage'),
      v.literal('condo'),
      v.literal('house')
    ),
    floor: v.optional(v.number()),
    maxVisitorCapacity: v.number(),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareFootage: v.optional(v.number()),
    rentAmount: v.optional(v.number()),
    tenantId: v.optional(v.id('users')),
    isOccupied: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_tenant', ['tenantId'])
    .index('by_unit_number', ['propertyId', 'unitNumber'])
    .index('by_occupied', ['isOccupied']),

  // User-Property relationships (for multi-property access)
  userProperties: defineTable({
    userId: v.id('users'),
    propertyId: v.id('properties'),
    role: v.union(v.literal('manager'), v.literal('tenant'), v.literal('vendor'), v.literal('field_technician')),
    permissions: v.array(v.string()), // Specific permissions
    isActive: v.boolean(),
    assignedAt: v.number(),
    assignedBy: v.id('users'),
  })
    .index('by_user', ['userId'])
    .index('by_property', ['propertyId'])
    .index('by_user_property', ['userId', 'propertyId'])
    .index('by_role', ['role']),

  // ==================== VISITOR MANAGEMENT ====================

  // Visitor requests and passes
  visitorRequests: defineTable({
    propertyId: v.id('properties'),
    unitId: v.id('units'),
    requestedBy: v.id('users'), // Tenant who requested
    visitorName: v.string(),
    visitorEmail: v.optional(v.string()),
    visitorPhone: v.optional(v.string()),
    visitorIdNumber: v.optional(v.string()),
    visitorIdType: v.optional(v.string()), // "driver_license", "passport", "national_id"
    purpose: v.string(),
    expectedArrival: v.number(), // Timestamp
    expectedDeparture: v.optional(v.number()),
    numberOfVisitors: v.number(),
    piiHash: v.string(), // Hash of PII blob includes propertyId, unitId, requestedBy, visitorName, visitorEmail, visitorPhone, visitorIdNumber, visitorIdType, expectedArrival, expectedDeparture, numberOfVisitors
    status: v.string(), // "pending", "approved", "denied", "cancelled", "expired"
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('denied'),
      v.literal('cancelled'),
      v.literal('expired')
    ), // "pending", "approved", "denied", "cancelled", "expired"
    approvedBy: v.optional(v.id('users')),
    approvedAt: v.optional(v.number()),
    deniedReason: v.optional(v.string()),
    documents: v.optional(
      v.array(
        v.object({
          fileName: v.string(),
          fileUrl: v.string(),
          uploadedAt: v.number(),
        })
      )
    ),
    blockchainTxHash: v.optional(v.string()), // For blockchain integration
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_unit', ['unitId'])
    .index('by_requested_by', ['requestedBy'])
    .index('by_status', ['status'])
    .index('by_arrival_date', ['expectedArrival'])
    .index('by_property_status', ['propertyId', 'status']),

  // Visitor check-in/out logs (blockchain integrated)
  visitorLogs: defineTable({
    visitorRequestId: v.id('visitorRequests'),
    propertyId: v.id('properties'),
    unitId: v.id('units'),
    visitorName: v.string(),
    action: v.union(v.literal('check_in'), v.literal('check_out'), v.literal('no_show')), // "check_in", "check_out", "no_show"
    timestamp: v.number(),
    location: v.optional(v.string()), // Specific location within property
    verifiedBy: v.optional(v.id('users')), // Security guard or system
    notes: v.optional(v.string()),
    blockchainTxHash: v.string(), // Immutable blockchain record URL
    createdAt: v.number(),
  })
    .index('by_visitor_request', ['visitorRequestId'])
    .index('by_property', ['propertyId'])
    .index('by_unit', ['unitId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_action', ['action'])
    .index('by_blockchain_hash', ['blockchainTxHash']),

  // Watchlist for security
  watchlist: defineTable({
    propertyId: v.id('properties'),
    name: v.string(),
    description: v.string(),
    riskLevel: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical')), // "low", "medium", "high", "critical"
    isActive: v.boolean(),
    createdBy: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_risk_level', ['riskLevel'])
    .index('by_active', ['isActive']),

  // ==================== DELIVERY MANAGEMENT ====================

  // Delivery requests and tracking
  deliveries: defineTable({
    propertyId: v.id('properties'),
    unitId: v.optional(v.id('units')), // Optional for common area deliveries
    deliveryType: v.union(
      v.literal('package'),
      v.literal('food'),
      v.literal('grocery'),
      v.literal('mail'),
      v.literal('other')
    ), // "package", "food", "grocery", "mail", "other"
    senderName: v.string(),
    senderCompany: v.optional(v.string()),
    recipientName: v.string(),
    recipientPhone: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    description: v.string(),
    estimatedDelivery: v.number(), // Timestamp
    actualDelivery: v.optional(v.number()),
    status: v.union(
      v.literal('pending'),
      v.literal('in_transit'),
      v.literal('delivered'),
      v.literal('collected'),
      v.literal('failed'),
      v.literal('returned')
    ), // "pending", "in_transit", "delivered", "collected", "failed", "returned"
    deliveryLocation: v.optional(v.string()), // "unit", "lobby", "mailroom", "storage"
    deliveryNotes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())), // Photo URLs
    blockchainTxHash: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_unit', ['unitId'])
    .index('by_status', ['status'])
    .index('by_delivery_date', ['estimatedDelivery'])
    .index('by_tracking', ['trackingNumber'])
    .index('by_property_status', ['propertyId', 'status']),

  // Delivery logs for audit trail
  deliveryLogs: defineTable({
    deliveryId: v.id('deliveries'),
    propertyId: v.id('properties'),
    action: v.union(
      v.literal('registered'),
      v.literal('assigned'),
      v.literal('delivered'),
      v.literal('collected'),
      v.literal('failed')
    ), // "registered", "assigned", "delivered", "collected", "failed"
    timestamp: v.number(),
    performedBy: v.optional(v.id('users')),
    notes: v.optional(v.string()),
    blockchainTxHash: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_delivery', ['deliveryId'])
    .index('by_property', ['propertyId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_action', ['action']),

  // ==================== PAYMENT SYSTEM ====================

  // Invoices and billing
  invoices: defineTable({
    propertyId: v.id('properties'),
    unitId: v.optional(v.id('units')),
    tenantId: v.id('users'),
    invoiceNumber: v.string(),
    invoiceType: v.union(
      v.literal('rent'),
      v.literal('maintenance'),
      v.literal('utility'),
      v.literal('fine'),
      v.literal('other')
    ), // "rent", "maintenance", "utility", "fine", "other"
    description: v.string(),
    amount: v.number(),
    taxAmount: v.optional(v.number()),
    totalAmount: v.number(),
    dueDate: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('paid'),
      v.literal('overdue'),
      v.literal('cancelled'),
      v.literal('refunded')
    ), // "pending", "paid", "overdue", "cancelled", "refunded"
    paidAt: v.optional(v.number()),
    paidAmount: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
    lateFee: v.optional(v.number()),
    items: v.array(
      v.object({
        description: v.string(),
        amount: v.number(),
        quantity: v.optional(v.number()),
      })
    ),
    blockchainTxHash: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_tenant', ['tenantId'])
    .index('by_unit', ['unitId'])
    .index('by_status', ['status'])
    .index('by_due_date', ['dueDate'])
    .index('by_invoice_number', ['invoiceNumber']),

  // Payment records
  payments: defineTable({
    invoiceId: v.id('invoices'),
    propertyId: v.id('properties'),
    tenantId: v.id('users'),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal('credit_card'),
      v.literal('bank_transfer'),
      v.literal('cash'),
      v.literal('crypto')
    ), // "credit_card", "bank_transfer", "cash", "crypto"
    paymentReference: v.optional(v.string()),
    status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'), v.literal('refunded')), // "pending", "completed", "failed", "refunded"
    processedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    blockchainTxHash: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_invoice', ['invoiceId'])
    .index('by_tenant', ['tenantId'])
    .index('by_property', ['propertyId'])
    .index('by_status', ['status'])
    .index('by_payment_method', ['paymentMethod']),

  // Blockchain receipts (NFTs)
  receipts: defineTable({
    paymentId: v.id('payments'),
    invoiceId: v.id('invoices'),
    propertyId: v.id('properties'),
    tenantId: v.id('users'),
    receiptNumber: v.string(),
    amount: v.number(),
    nftTokenId: v.optional(v.string()),
    nftContractAddress: v.optional(v.string()),
    blockchainTxHash: v.string(),
    blockNumber: v.number(),
    metadata: v.optional(
      v.object({
        description: v.string(),
        items: v.array(v.string()),
        timestamp: v.number(),
      })
    ),
    createdAt: v.number(),
  })
    .index('by_payment', ['paymentId'])
    .index('by_invoice', ['invoiceId'])
    .index('by_tenant', ['tenantId'])
    .index('by_property', ['propertyId'])
    .index('by_nft_token', ['nftTokenId'])
    .index('by_blockchain_hash', ['blockchainTxHash']),

  // ==================== MAINTENANCE SYSTEM ====================

  // Maintenance requests
  maintenanceRequests: defineTable({
    propertyId: v.id('properties'),
    unitId: v.optional(v.id('units')),
    requestedBy: v.id('users'),
    requestType: v.union(
      v.literal('plumbing'),
      v.literal('electrical'),
      v.literal('hvac'),
      v.literal('appliance'),
      v.literal('general'),
      v.literal('emergency')
    ),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('emergency')),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('rejected')
    ),
    assignedTo: v.optional(v.id('users')), // Vendor or technician
    assignedAt: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    estimatedCompletion: v.optional(v.number()),
    actualCompletion: v.optional(v.number()),
    photos: v.optional(v.array(v.string())),
    documents: v.optional(v.array(v.string())),
    tenantApproval: v.optional(v.boolean()),
    tenantApprovalAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_unit', ['unitId'])
    .index('by_requested_by', ['requestedBy'])
    .index('by_assigned_to', ['assignedTo'])
    .index('by_status', ['status'])
    .index('by_priority', ['priority'])
    .index('by_request_type', ['requestType'])
    .index('by_property_status', ['propertyId', 'status']),

  // Maintenance status updates
  maintenanceUpdates: defineTable({
    requestId: v.id('maintenanceRequests'),
    propertyId: v.id('properties'),
    status: v.union(
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('rejected')
    ),
    description: v.string(),
    updatedBy: v.id('users'),
    photos: v.optional(v.array(v.string())),
    timestamp: v.number(),
  })
    .index('by_request', ['requestId'])
    .index('by_property', ['propertyId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_updated_by', ['updatedBy']),

  // ==================== COMMUNICATION SYSTEM ====================

  // Notices and announcements
  notices: defineTable({
    propertyId: v.id('properties'),
    unitId: v.optional(v.id('units')), // Optional for property-wide notices
    createdBy: v.id('users'),
    title: v.string(),
    content: v.string(),
    noticeType: v.union(
      v.literal('announcement'),
      v.literal('maintenance'),
      v.literal('payment_reminder'),
      v.literal('emergency'),
      v.literal('event')
    ), // "announcement", "maintenance", "payment_reminder", "emergency", "event"
    priority: v.string(), // "low", "medium", "high", "urgent"
    targetAudience: v.string(), // "all", "tenants", "specific_units", "managers"
    targetUnits: v.optional(v.array(v.id('units'))),
    isActive: v.boolean(),
    scheduledAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_created_by', ['createdBy'])
    .index('by_type', ['noticeType'])
    .index('by_priority', ['priority'])
    .index('by_active', ['isActive'])
    .index('by_scheduled', ['scheduledAt'])
    .index('by_expires', ['expiresAt']),

  // Notice acknowledgments
  noticeAcknowledgments: defineTable({
    noticeId: v.id('notices'),
    userId: v.id('users'),
    acknowledgedAt: v.number(),
  })
    .index('by_notice', ['noticeId'])
    .index('by_user', ['userId'])
    .index('by_notice_user', ['noticeId', 'userId']),

  // Events and calendar
  events: defineTable({
    propertyId: v.id('properties'),
    createdBy: v.id('users'),
    title: v.string(),
    description: v.string(),
    eventType: v.string(), // "community", "maintenance", "meeting", "social", "emergency"
    startDate: v.number(),
    endDate: v.number(),
    location: v.optional(v.string()),
    isRecurring: v.boolean(),
    recurringPattern: v.optional(v.string()), // "daily", "weekly", "monthly", "yearly"
    maxAttendees: v.optional(v.number()),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_created_by', ['createdBy'])
    .index('by_start_date', ['startDate'])
    .index('by_type', ['eventType'])
    .index('by_public', ['isPublic']),

  // Event attendees
  eventAttendees: defineTable({
    eventId: v.id('events'),
    userId: v.id('users'),
    status: v.string(), // "attending", "maybe", "declined"
    registeredAt: v.number(),
  })
    .index('by_event', ['eventId'])
    .index('by_user', ['userId'])
    .index('by_event_user', ['eventId', 'userId']),

  // Polls and surveys
  polls: defineTable({
    propertyId: v.id('properties'),
    createdBy: v.id('users'),
    title: v.string(),
    description: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    pollType: v.string(), // "single_choice", "multiple_choice", "rating", "text"
    isActive: v.boolean(),
    allowAnonymous: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_created_by', ['createdBy'])
    .index('by_active', ['isActive'])
    .index('by_expires', ['expiresAt']),

  // Poll responses
  pollResponses: defineTable({
    pollId: v.id('polls'),
    userId: v.optional(v.id('users')), // Optional for anonymous polls
    selectedOptions: v.array(v.number()), // Indices of selected options
    textResponse: v.optional(v.string()),
    submittedAt: v.number(),
  })
    .index('by_poll', ['pollId'])
    .index('by_user', ['userId'])
    .index('by_poll_user', ['pollId', 'userId']),

  // ==================== CHAT SYSTEM ====================

  // Chat threads
  chatThreads: defineTable({
    propertyId: v.id('properties'),
    threadType: v.string(), // "individual", "group", "maintenance", "emergency"
    title: v.optional(v.string()),
    participants: v.array(v.id('users')),
    lastMessageAt: v.optional(v.number()),
    isArchived: v.boolean(),
    assignedTo: v.optional(v.id('users')), // For maintenance/emergency threads
    priority: v.optional(v.string()), // "low", "medium", "high", "urgent"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_type', ['threadType'])
    .index('by_participants', ['participants'])
    .index('by_last_message', ['lastMessageAt'])
    .index('by_archived', ['isArchived'])
    .index('by_assigned', ['assignedTo']),

  // Chat messages
  messages: defineTable({
    threadId: v.id('chatThreads'),
    senderId: v.id('users'),
    content: v.string(),
    messageType: v.string(), // "text", "image", "file", "system"
    attachments: v.optional(
      v.array(
        v.object({
          fileName: v.string(),
          fileUrl: v.string(),
          fileType: v.string(),
          fileSize: v.number(),
        })
      )
    ),
    isRead: v.boolean(),
    readBy: v.optional(
      v.array(
        v.object({
          userId: v.id('users'),
          readAt: v.number(),
        })
      )
    ),
    replyTo: v.optional(v.id('messages')),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_thread', ['threadId'])
    .index('by_sender', ['senderId'])
    .index('by_created_at', ['createdAt'])
    .index('by_message_type', ['messageType'])
    .index('by_read', ['isRead']),

  // ==================== ASSET MANAGEMENT ====================

  // Assets and inventory
  assets: defineTable({
    propertyId: v.id('properties'),
    assetTag: v.string(), // Barcode/RFID/QR code
    name: v.string(),
    description: v.string(),
    category: v.string(), // "tool", "equipment", "material", "furniture", "appliance"
    subcategory: v.optional(v.string()),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    condition: v.string(), // "excellent", "good", "fair", "poor", "broken"
    status: v.string(), // "available", "checked_out", "maintenance", "retired", "lost"
    location: v.string(),
    assignedTo: v.optional(v.id('users')),
    assignedAt: v.optional(v.number()),
    maintenanceSchedule: v.optional(
      v.object({
        interval: v.number(), // Days between maintenance
        lastMaintenance: v.optional(v.number()),
        nextMaintenance: v.optional(v.number()),
      })
    ),
    warrantyExpiry: v.optional(v.number()),
    photos: v.optional(v.array(v.string())),
    documents: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_asset_tag', ['assetTag'])
    .index('by_category', ['category'])
    .index('by_status', ['status'])
    .index('by_assigned_to', ['assignedTo'])
    .index('by_location', ['location'])
    .index('by_condition', ['condition']),

  // Asset check-in/out history
  assetHistory: defineTable({
    assetId: v.id('assets'),
    propertyId: v.id('properties'),
    action: v.string(), // "check_out", "check_in", "transfer", "maintenance", "retire"
    fromUser: v.optional(v.id('users')),
    toUser: v.optional(v.id('users')),
    fromLocation: v.optional(v.string()),
    toLocation: v.optional(v.string()),
    notes: v.optional(v.string()),
    timestamp: v.number(),
    performedBy: v.id('users'),
  })
    .index('by_asset', ['assetId'])
    .index('by_property', ['propertyId'])
    .index('by_action', ['action'])
    .index('by_timestamp', ['timestamp'])
    .index('by_performed_by', ['performedBy']),

  // ==================== IOT INTEGRATION ====================

  // IoT devices
  iotDevices: defineTable({
    propertyId: v.id('properties'),
    unitId: v.optional(v.id('units')),
    deviceId: v.string(), // Unique device identifier
    deviceType: v.string(), // "water_meter", "electricity_meter", "thermostat", "security_camera"
    deviceName: v.string(),
    location: v.string(),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    isActive: v.boolean(),
    lastReadingAt: v.optional(v.number()),
    settings: v.optional(
      v.object({
        readingInterval: v.optional(v.number()), // Minutes
        alertThresholds: v.optional(
          v.object({
            min: v.optional(v.number()),
            max: v.optional(v.number()),
          })
        ),
        unit: v.optional(v.string()), // "gallons", "kwh", "celsius", "fahrenheit"
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_unit', ['unitId'])
    .index('by_device_id', ['deviceId'])
    .index('by_device_type', ['deviceType'])
    .index('by_active', ['isActive']),

  // IoT readings
  iotReadings: defineTable({
    deviceId: v.id('iotDevices'),
    propertyId: v.id('properties'),
    unitId: v.optional(v.id('units')),
    readingType: v.string(), // "water_consumption", "electricity_consumption", "temperature", "humidity"
    value: v.number(),
    unit: v.string(),
    timestamp: v.number(),
    isAnomaly: v.boolean(),
    anomalyReason: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        batteryLevel: v.optional(v.number()),
        signalStrength: v.optional(v.number()),
        temperature: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
  })
    .index('by_device', ['deviceId'])
    .index('by_property', ['propertyId'])
    .index('by_unit', ['unitId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_reading_type', ['readingType'])
    .index('by_anomaly', ['isAnomaly'])
    .index('by_device_timestamp', ['deviceId', 'timestamp']),

  // ==================== SYSTEM TABLES ====================

  // Audit logs for all system activities
  auditLogs: defineTable({
    propertyId: v.optional(v.id('properties')),
    userId: v.optional(v.id('users')),
    action: v.string(),
    resourceType: v.string(), // Table name
    resourceId: v.optional(v.string()),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_user', ['userId'])
    .index('by_action', ['action'])
    .index('by_resource', ['resourceType', 'resourceId'])
    .index('by_timestamp', ['timestamp']),

  // System settings and configuration
  systemSettings: defineTable({
    propertyId: v.optional(v.id('properties')), // Global settings if null
    settingKey: v.string(),
    settingValue: v.any(),
    settingType: v.string(), // "string", "number", "boolean", "object", "array"
    description: v.optional(v.string()),
    isPublic: v.boolean(), // Whether setting can be read by non-admins
    updatedBy: v.id('users'),
    updatedAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_key', ['settingKey'])
    .index('by_property_key', ['propertyId', 'settingKey']),

  // Push notifications
  notifications: defineTable({
    userId: v.id('users'),
    propertyId: v.optional(v.id('properties')),
    title: v.string(),
    body: v.string(),
    notificationType: v.string(), // "visitor", "delivery", "maintenance", "payment", "emergency", "general"
    data: v.optional(v.any()), // Additional data for deep linking
    isRead: v.boolean(),
    sentAt: v.optional(v.number()),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_property', ['propertyId'])
    .index('by_type', ['notificationType'])
    .index('by_read', ['isRead'])
    .index('by_created_at', ['createdAt']),

  // File uploads and attachments
  fileUploads: defineTable({
    propertyId: v.optional(v.id('properties')),
    uploadedBy: v.id('users'),
    fileName: v.string(),
    originalFileName: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    isPublic: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_uploaded_by', ['uploadedBy'])
    .index('by_file_type', ['fileType'])
    .index('by_expires', ['expiresAt'])
    .index('by_created_at', ['createdAt']),
});
