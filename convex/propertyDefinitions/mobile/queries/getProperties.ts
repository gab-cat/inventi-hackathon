import { QueryCtx } from '../../../_generated/server';
import { v } from 'convex/values';

export const getPropertiesArgs = v.object({
  // Search parameters
  searchQuery: v.optional(v.string()),

  // Filters
  propertyType: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),

  // Pagination
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
});

export const getPropertiesHandler = async (
  ctx: QueryCtx,
  args: {
    searchQuery?: string;
    propertyType?: string;
    isActive?: boolean;
    city?: string;
    state?: string;
    limit?: number;
    cursor?: string;
  }
) => {
  const limit = args.limit || 20; // Default limit of 20

  // Start building the query
  let query = ctx.db.query('properties');

  // Apply filters first
  if (args.isActive !== undefined) {
    query = query.filter(q => q.eq(q.field('isActive'), args.isActive));
  }

  if (args.propertyType) {
    query = query.filter(q => q.eq(q.field('propertyType'), args.propertyType));
  }

  if (args.city) {
    query = query.filter(q => q.eq(q.field('city'), args.city));
  }

  if (args.state) {
    query = query.filter(q => q.eq(q.field('state'), args.state));
  }

  // Apply search query if provided
  if (args.searchQuery && args.searchQuery.trim()) {
    const searchTerm = args.searchQuery.trim().toLowerCase();

    // For search, we need to collect and filter manually since Convex doesn't support
    // full-text search across multiple fields directly
    const allProperties = await query.collect();

    const filteredProperties = allProperties.filter(property => {
      const searchableFields = [
        property.name?.toLowerCase(),
        property.address?.toLowerCase(),
        property.city?.toLowerCase(),
        property.state?.toLowerCase(),
        property.zipCode?.toLowerCase(),
        property.country?.toLowerCase(),
        property.propertyType?.toLowerCase(),
      ].filter(Boolean); // Remove null/undefined values

      return searchableFields.some(field => field?.includes(searchTerm));
    });

    // Apply pagination to filtered results
    const startIndex = args.cursor ? parseInt(args.cursor) : 0;
    const endIndex = startIndex + limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredProperties.length;
    const nextCursor = hasMore ? endIndex.toString() : null;

    return {
      success: true,
      properties: paginatedProperties,
      hasMore,
      nextCursor,
      total: filteredProperties.length,
    };
  } else {
    // No search query, use standard pagination
    const paginationResult = await query.paginate({
      numItems: limit,
      cursor: args.cursor || null,
    });

    return {
      success: true,
      properties: paginationResult.page,
      hasMore: !paginationResult.isDone,
      nextCursor: paginationResult.continueCursor,
    };
  }
};
