export * from './mobile';

// Mobile functions - renamed exports (remove mobile prefix)
export {
  getUserPropertiesArgs as getUserPropertiesArgs,
  getUserPropertiesHandler as getUserPropertiesHandler,
  getUserPropertiesReturns as getUserPropertiesReturns,
} from './mobile/queries/getUserProperties';

// Web Queries
export * from './web';
