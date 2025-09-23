// Web Queries
export * from './web/queries/getDeliveryById';
export * from './web/queries/getDeliveryLog';
export * from './web/queries/searchDeliveryHistory';
export * from './web/queries/exportDeliveryReports';

// Web Mutations
export * from './web/mutations/registerDelivery';
export * from './web/mutations/assignDeliveryToRecipient';
export * from './web/mutations/markDeliveryAsCollected';
export * from './web/mutations/updateDeliveryStatus';

// Mobile Queries
export {
  mobileGetMyDeliveriesArgs as getMyDeliveriesArgs,
  mobileGetMyDeliveriesHandler as getMyDeliveriesHandler,
  mobileGetMyDeliveriesReturns as getMyDeliveriesReturns,
} from './mobile/queries/getMyDeliveries';

export {
  mobileGetDeliveryStatusArgs as getDeliveryStatusArgs,
  mobileGetDeliveryStatusHandler as getDeliveryStatusHandler,
  mobileGetDeliveryStatusReturns as getDeliveryStatusReturns,
} from './mobile/queries/getDeliveryStatus';

// Mobile Mutations
export {
  mobileNotifyIncomingDeliveryArgs as notifyIncomingDeliveryArgs,
  mobileNotifyIncomingDeliveryHandler as notifyIncomingDeliveryHandler,
  mobileNotifyIncomingDeliveryReturns as notifyIncomingDeliveryReturns,
} from './mobile/mutations/notifyIncomingDelivery';

export {
  mobileConfirmDeliveryReceiptArgs as confirmDeliveryReceiptArgs,
  mobileConfirmDeliveryReceiptHandler as confirmDeliveryReceiptHandler,
  mobileConfirmDeliveryReceiptReturns as confirmDeliveryReceiptReturns,
} from './mobile/mutations/confirmDeliveryReceipt';

export {
  mobileReportDeliveryIssueArgs as reportDeliveryIssueArgs,
  mobileReportDeliveryIssueHandler as reportDeliveryIssueHandler,
  mobileReportDeliveryIssueReturns as reportDeliveryIssueReturns,
} from './mobile/mutations/reportDeliveryIssue';

export {
  mobileGetDeliveryLogArgs as getDeliveryLogArgs,
  mobileGetDeliveryLogHandler as getDeliveryLogHandler,
  mobileGetDeliveryLogReturns as getDeliveryLogReturns,
} from './mobile/queries/getDeliveryLog';
