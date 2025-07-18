/**
 * Base filter types for health data queries
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

export type FilterForSamplesAnd = {
  readonly AND: FilterForSamples[];
};

export type FilterForSamplesOr = {
  readonly OR: FilterForSamples[];
};

export type PredicateFromWorkout = {
  readonly workout: any; // WorkoutProxy type from healthkit
};

export type FilterForSamples = PredicateForSamples | FilterForSamplesAnd | FilterForSamplesOr;

export type PredicateForSamples = 
  | PredicateWithUUID 
  | PredicateWithUUIDs 
  | PredicateWithMetadataKey 
  | PredicateWithStartAndEnd 
  | PredicateFromWorkout;

/**
 * Generic query options for health data
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