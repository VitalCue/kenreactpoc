/**
 * Base query parameters interface
 */
export interface QueryParams {
  // Common params
  startDate?: Date;
  endDate?: Date;
  pageSize?: number;
  
  // iOS-specific query options
  ios?: {
    filter?: any; // FilterForSamples
    anchor?: string;
    limit?: number;
    ascending?: boolean;
    unit?: string;
  };
  
  // Android-specific query options
  android?: {
    dataOriginFilter?: string[];
    pageToken?: string;
  };
}