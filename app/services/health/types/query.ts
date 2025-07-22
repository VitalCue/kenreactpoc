/**
 * Base query parameters interface
 */
export interface QueryParams {
  // Common params
  startDate?: Date;
  endDate?: Date;
  pageSize?: number;
  
  // Anchored query options
  useAnchored?: boolean; // Whether to use anchored queries (default: true if anchor exists)
  setupAnchor?: boolean; // Whether to setup anchor after initial query (default: true)
  onDeletedSamples?: (deletedIds: string[]) => void; // Callback for handling deleted samples
  
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
    syncToken?: string; // For Google Fit incremental sync
  };
}