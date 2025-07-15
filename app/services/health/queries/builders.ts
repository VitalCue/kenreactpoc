import type { QueryParams } from './types';
import { Filters } from './filters';

/**
 * Query builder for health data queries
 */
export class HealthQueryBuilder {
  private params: QueryParams = {};
  
  /**
   * Set date range
   */
  dateRange(startDate: Date, endDate: Date): HealthQueryBuilder {
    this.params.startDate = startDate;
    this.params.endDate = endDate;
    return this;
  }
  
  /**
   * Set page size
   */
  limit(pageSize: number): HealthQueryBuilder {
    this.params.pageSize = pageSize;
    return this;
  }
  
  /**
   * iOS-specific options
   */
  ios(options: NonNullable<QueryParams['ios']>): HealthQueryBuilder {
    this.params.ios = options;
    return this;
  }
  
  /**
   * Android-specific options
   */
  android(options: NonNullable<QueryParams['android']>): HealthQueryBuilder {
    this.params.android = options;
    return this;
  }
  
  /**
   * Build the query parameters
   */
  build(): QueryParams {
    return { ...this.params };
  }
}

/**
 * Common health query presets
 */
export const HealthQueries = {
  /**
   * Get today's data
   */
  today: (limit: number = 100): QueryParams => ({
    startDate: (() => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return start;
    })(),
    endDate: (() => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return end;
    })(),
    pageSize: limit,
    ios: {
      filter: Filters.today()
    }
  }),
  
  /**
   * Get last N days of data
   */
  lastDays: (days: number, limit: number = 100): QueryParams => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return {
      startDate,
      endDate,
      pageSize: limit,
      ios: {
        filter: Filters.lastDays(days)
      }
    };
  },
  
  /**
   * Get this week's data
   */
  thisWeek: (limit: number = 100): QueryParams => ({
    pageSize: limit,
    ios: {
      filter: Filters.thisWeek()
    }
  }),
  
  /**
   * Get this month's data
   */
  thisMonth: (limit: number = 100): QueryParams => ({
    pageSize: limit,
    ios: {
      filter: Filters.thisMonth()
    }
  }),
  
  /**
   * Get data excluding manual entries (device-generated only)
   */
  deviceOnly: (days: number = 7, limit: number = 100): QueryParams => ({
    pageSize: limit,
    ios: {
      filter: Filters.and(
        Filters.lastDays(days),
        Filters.excludeManualEntries()
      )
    }
  })
};

/**
 * Helper to create a health query builder
 */
export const createHealthQuery = (): HealthQueryBuilder => {
  return new HealthQueryBuilder();
};