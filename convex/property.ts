import { query, mutation } from './_generated/server';
import {
  getMyPropertiesArgs,
  getMyPropertiesHandler,
  getPropertiesArgs,
  getPropertiesHandler,
  webGetManagerPropertiesArgs,
  webGetManagerPropertiesHandler,
  webCreatePropertyArgs,
  webCreatePropertyHandler,
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
