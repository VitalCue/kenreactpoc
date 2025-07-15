import type { AnyMap } from 'react-native-nitro-modules';

/**
 * iOS HealthKit filter types based on react-native-healthkit
 */
export type PredicateWithUUID = {
  readonly uuid: string;
};

export type PredicateWithUUIDs = {
  readonly uuids: readonly string[];
};

export type PredicateWithStartAndEnd = {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly strictEndDate?: boolean;
  readonly strictStartDate?: boolean;
};

export type PredicateWithMetadataKey = {
  readonly withMetadataKey: string;
};

export type PredicateFromWorkout = {
  readonly workout: any; // WorkoutProxy type from healthkit
};

export type PredicateForSamples = 
  | PredicateWithUUID 
  | PredicateWithUUIDs 
  | PredicateWithMetadataKey 
  | PredicateWithStartAndEnd 
  | PredicateFromWorkout;

export type FilterForSamplesAnd = {
  readonly AND: FilterForSamples[];
};

export type FilterForSamplesOr = {
  readonly OR: FilterForSamples[];
};

export type FilterForSamples = PredicateForSamples | FilterForSamplesAnd | FilterForSamplesOr;

/**
 * Generic query options from react-native-healthkit
 */
export interface GenericQueryOptions {
  filter?: FilterForSamples;
  readonly limit?: number;
}

export interface QueryOptionsWithAnchor extends GenericQueryOptions {
  readonly anchor?: string;
}

export interface QueryOptionsWithSortOrder extends GenericQueryOptions {
  readonly ascending?: boolean;
}

export interface QueryOptionsWithSortOrderAndUnit extends QueryOptionsWithSortOrder {
  readonly unit?: string;
}

export interface QueryOptionsWithAnchorAndUnit extends QueryOptionsWithAnchor {
  readonly unit?: string;
}

/**
 * Platform-aware query parameters
 */
export interface QueryParams {
  // Common params
  startDate?: Date;
  endDate?: Date;
  pageSize?: number;
  
  // iOS-specific query options aligned with react-native-healthkit
  ios?: QueryOptionsWithSortOrderAndUnit & {
    filter?: FilterForSamples;
    anchor?: string; // For pagination
  };
  
  // Android-specific query options
  android?: {
    dataOriginFilter?: string[]; // package names
    metadataFilter?: AnyMap;
    pageToken?: string;
  };
}