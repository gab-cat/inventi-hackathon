import { mutation, query } from './_generated/server';
import {
  getMyUnitsArgs,
  getMyUnitsHandler,
  getUnitDetailsArgs,
  getUnitDetailsHandler,
  getUnitsByPropertyArgs,
  getUnitsByPropertyHandler,
  createUnitArgs,
  createUnitHandler,
  updateUnitHandler,
  updateUnitArgs,
  assignTenantToUnitHandler,
  assignTenantToUnitArgs,
  createAndAssignUnitHandler,
  createAndAssignUnitArgs,
  // Web queries
  webGetUnitsByPropertyArgs,
  webGetUnitsByPropertyHandler,
} from './unitDefinitions';

export const getMyUnits = query({
  args: getMyUnitsArgs,
  handler: getMyUnitsHandler,
});

export const getUnitDetails = query({
  args: getUnitDetailsArgs,
  handler: getUnitDetailsHandler,
});

export const getUnitsByProperty = query({
  args: getUnitsByPropertyArgs,
  handler: getUnitsByPropertyHandler,
});

export const createUnit = mutation({
  args: createUnitArgs,
  handler: createUnitHandler,
});

export const updateUnit = mutation({
  args: updateUnitArgs,
  handler: updateUnitHandler,
});

export const assignTenantToUnit = mutation({
  args: assignTenantToUnitArgs,
  handler: assignTenantToUnitHandler,
});

export const createAndAssignUnit = mutation({
  args: createAndAssignUnitArgs,
  handler: createAndAssignUnitHandler,
});

// Web Queries
export const webGetUnitsByProperty = query({
  args: webGetUnitsByPropertyArgs,
  handler: webGetUnitsByPropertyHandler,
});
