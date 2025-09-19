import { mutation } from './_generated/server';
import { webManageWatchlistArgs, webManageWatchlistHandler, webManageWatchlistReturns } from './watchListDefinitions';

// Web Mutations
export const webManageWatchlist = mutation({
  args: webManageWatchlistArgs,
  returns: webManageWatchlistReturns,
  handler: webManageWatchlistHandler,
});
