import type { AnyMap } from 'react-native-nitro-modules';
import type {
  PredicateWithUUID,
  PredicateWithUUIDs,
  PredicateWithStartAndEnd,
  PredicateWithMetadataKey,
  PredicateFromWorkout,
  PredicateForSamples,
  FilterForSamplesAnd,
  FilterForSamplesOr,
  FilterForSamples,
  GenericQueryOptions,
  QueryOptionsWithAnchor,
  QueryOptionsWithSortOrder,
  QueryOptionsWithSortOrderAndUnit,
  QueryOptionsWithAnchorAndUnit
} from '../types/filters';
import type { QueryParams } from '../types/query';

// Re-export filter types for backwards compatibility
export type {
  PredicateWithUUID,
  PredicateWithUUIDs,
  PredicateWithStartAndEnd,
  PredicateWithMetadataKey,
  PredicateFromWorkout,
  PredicateForSamples,
  FilterForSamplesAnd,
  FilterForSamplesOr,
  FilterForSamples,
  GenericQueryOptions,
  QueryOptionsWithAnchor,
  QueryOptionsWithSortOrder,
  QueryOptionsWithSortOrderAndUnit,
  QueryOptionsWithAnchorAndUnit,
  QueryParams
};

// Query option interfaces are now imported from ../types/filters above

// QueryParams is now imported from ../types/query above