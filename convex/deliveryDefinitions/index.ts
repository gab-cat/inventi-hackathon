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

// Web Actions
export * from './web/actions/updateDeliveryStatusWithContract';

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

export {
  mobileGetDeliveryByPiiHashArgs as mobileGetDeliveryByPiiHashArgs,
  mobileGetDeliveryByPiiHashHandler as mobileGetDeliveryByPiiHashHandler,
  mobileGetDeliveryByPiiHashReturns as mobileGetDeliveryByPiiHashReturns,
} from './mobile/queries/getDeliveryByPiiHash';

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
  mobileUpdateDeliveryStatusArgs as mobileUpdateDeliveryStatusArgs,
  mobileUpdateDeliveryStatusHandler as mobileUpdateDeliveryStatusHandler,
  mobileUpdateDeliveryStatusReturns as mobileUpdateDeliveryStatusReturns,
} from './mobile/mutations/updateDeliveryStatus';

export {
  mobileLogDeliveryActionArgs as mobileLogDeliveryActionArgs,
  mobileLogDeliveryActionHandler as mobileLogDeliveryActionHandler,
  mobileLogDeliveryActionReturns as mobileLogDeliveryActionReturns,
} from './mobile/mutations/logDeliveryAction';

export {
  mobileUpdateDeliveryActualTimeArgs as mobileUpdateDeliveryActualTimeArgs,
  mobileUpdateDeliveryActualTimeHandler as mobileUpdateDeliveryActualTimeHandler,
  mobileUpdateDeliveryActualTimeReturns as mobileUpdateDeliveryActualTimeReturns,
} from './mobile/mutations/updateDeliveryActualTime';

export {
  mobileRegisterDeliveryArgs as mobileRegisterDeliveryArgs,
  mobileRegisterDeliveryHandler as mobileRegisterDeliveryHandler,
  mobileRegisterDeliveryReturns as mobileRegisterDeliveryReturns,
} from './mobile/actions/registerDelivery';

export {
  mobileRegisterDeliveryDbArgs as mobileRegisterDeliveryDbArgs,
  mobileRegisterDeliveryDbHandler as mobileRegisterDeliveryDbHandler,
  mobileRegisterDeliveryDbReturns as mobileRegisterDeliveryDbReturns,
} from './mobile/mutations/registerDeliveryDb';

export {
  mobileGetDeliveryLogArgs as getDeliveryLogArgs,
  mobileGetDeliveryLogHandler as getDeliveryLogHandler,
  mobileGetDeliveryLogReturns as getDeliveryLogReturns,
} from './mobile/queries/getDeliveryLog';

// Mobile Contract Actions
export {
  mobileRegisterDeliveryContractArgs as registerDeliveryContractArgs,
  mobileRegisterDeliveryContractHandler as registerDeliveryContractHandler,
  mobileRegisterDeliveryContractReturns as registerDeliveryContractReturns,
} from './mobile/actions/registerDeliveryContract';

export {
  mobileUpdateDeliveryStatusContractArgs as updateDeliveryStatusContractArgs,
  mobileUpdateDeliveryStatusContractHandler as updateDeliveryStatusContractHandler,
  mobileUpdateDeliveryStatusContractReturns as updateDeliveryStatusContractReturns,
} from './mobile/actions/updateDeliveryStatusContract';

export {
  mobileGetDeliveryContractArgs as getDeliveryContractArgs,
  mobileGetDeliveryContractHandler as getDeliveryContractHandler,
  mobileGetDeliveryContractReturns as getDeliveryContractReturns,
} from './mobile/actions/getDeliveryContract';
