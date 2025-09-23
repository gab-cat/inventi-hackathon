import { query } from './_generated/server';
import {
  webGetDeliveryLogsByPropertyArgs,
  webGetDeliveryLogsByPropertyHandler,
  webGetDeliveryLogsByPropertyReturns,
} from './deliveryLogDefinitions/index';

// Web Queries
export const webGetDeliveryLogsByProperty = query({
  args: webGetDeliveryLogsByPropertyArgs,
  returns: webGetDeliveryLogsByPropertyReturns,
  handler: webGetDeliveryLogsByPropertyHandler,
});
