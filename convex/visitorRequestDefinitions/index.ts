export * from './web/queries';
export * from './web/mutations';

// Mobile functions - renamed exports (remove mobile prefix)
export {
  mobileRequestVisitorPassArgs as requestVisitorPassArgs,
  mobileRequestVisitorPassHandler as requestVisitorPassHandler,
  mobileRequestVisitorPassReturns as requestVisitorPassReturns,
} from './mobile/mutations/requestVisitorPass';

export {
  mobileCancelVisitorRequestArgs as cancelVisitorRequestArgs,
  mobileCancelVisitorRequestHandler as cancelVisitorRequestHandler,
  mobileCancelVisitorRequestReturns as cancelVisitorRequestReturns,
} from './mobile/mutations/cancelVisitorRequest';

export {
  mobileUploadVisitorDocumentArgs as uploadVisitorDocumentArgs,
  mobileUploadVisitorDocumentHandler as uploadVisitorDocumentHandler,
  mobileUploadVisitorDocumentReturns as uploadVisitorDocumentReturns,
} from './mobile/mutations/uploadVisitorDocument';

export {
  mobileSaveUploadedVisitorDocumentArgs as saveUploadedVisitorDocumentArgs,
  mobileSaveUploadedVisitorDocumentHandler as saveUploadedVisitorDocumentHandler,
  mobileSaveUploadedVisitorDocumentReturns as saveUploadedVisitorDocumentReturns,
} from './mobile/mutations/saveUploadedVisitorDocument';

export {
  mobileGetMyVisitorsArgs as getMyVisitorsArgs,
  mobileGetMyVisitorsHandler as getMyVisitorsHandler,
  mobileGetMyVisitorsReturns as getMyVisitorsReturns,
} from './mobile/queries/getMyVisitors';

export {
  mobileGetVisitorStatusArgs as getVisitorStatusArgs,
  mobileGetVisitorStatusHandler as getVisitorStatusHandler,
  mobileGetVisitorStatusReturns as getVisitorStatusReturns,
} from './mobile/queries/getVisitorStatus';
