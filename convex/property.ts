import { query, mutation, action } from './_generated/server';
import {
  getMyPropertiesArgs,
  getMyPropertiesHandler,
  getPropertiesArgs,
  getPropertiesHandler,
  webGetManagerPropertiesArgs,
  webGetManagerPropertiesHandler,
  webCreatePropertyArgs,
  webCreatePropertyHandler,
  // Contract actions
  mobileAuthorizeWalletContractArgs,
  mobileAuthorizeWalletContractHandler,
  mobileAuthorizeWalletContractReturns,
  mobileRegisterUnitContractArgs,
  mobileRegisterUnitContractHandler,
  mobileRegisterUnitContractReturns,
  mobileIsAuthorizedContractArgs,
  mobileIsAuthorizedContractHandler,
  mobileIsAuthorizedContractReturns,
} from './propertyDefinitions';

export const getMyProperties = query({
  args: getMyPropertiesArgs,
  handler: getMyPropertiesHandler,
});

export const getProperties = query({
  args: getPropertiesArgs,
  handler: getPropertiesHandler,
});

// Web Queries
export const webGetManagerProperties = query({
  args: webGetManagerPropertiesArgs,
  handler: webGetManagerPropertiesHandler,
});

// Web Mutations
export const webCreateProperty = mutation({
  args: webCreatePropertyArgs,
  handler: webCreatePropertyHandler,
});

// Mobile Contract Actions
export const authorizeWalletContract = action({
  args: mobileAuthorizeWalletContractArgs,
  returns: mobileAuthorizeWalletContractReturns,
  handler: mobileAuthorizeWalletContractHandler,
});

export const registerUnitContract = action({
  args: mobileRegisterUnitContractArgs,
  returns: mobileRegisterUnitContractReturns,
  handler: mobileRegisterUnitContractHandler,
});

export const isAuthorizedContract = action({
  args: mobileIsAuthorizedContractArgs,
  returns: mobileIsAuthorizedContractReturns,
  handler: mobileIsAuthorizedContractHandler,
});
