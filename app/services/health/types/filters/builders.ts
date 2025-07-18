import type { 
  PredicateWithUUID, 
  PredicateWithUUIDs, 
  PredicateWithMetadataKey, 
  PredicateWithStartAndEnd, 
  PredicateFromWorkout, 
  FilterForSamplesAnd, 
  FilterForSamplesOr, 
  PredicateForSamples 
} from './base';

/**
 * Filter builder utility functions for health data queries
 */
export const Filters = {
  // Basic filters
  uuid: (uuid: string): PredicateWithUUID => ({ uuid }),
  uuids: (uuids: string[]): PredicateWithUUIDs => ({ uuids }),
  metadataKey: (key: string): PredicateWithMetadataKey => ({ withMetadataKey: key }),
  dateRange: (options: {
    startDate?: Date;
    endDate?: Date;
    strictStartDate?: boolean;
    strictEndDate?: boolean;
  }): PredicateWithStartAndEnd => options,
  workout: (workout: any): PredicateFromWorkout => ({ workout }),
  
  // Composite filters
  and: (...predicates: PredicateForSamples[]): FilterForSamplesAnd => ({ AND: predicates }),
  or: (...predicates: PredicateForSamples[]): FilterForSamplesOr => ({ OR: predicates }),
  
  // Common presets
  today: (): PredicateWithStartAndEnd => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  },
  
  lastDays: (days: number): PredicateWithStartAndEnd => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { startDate: start, endDate: end };
  },
  
  excludeManualEntries: (): FilterForSamplesOr => ({
    OR: [
      { withMetadataKey: 'HKMetadataKeyDeviceSerialNumber' },
      { withMetadataKey: 'HKMetadataKeyDigitallySigned' }
    ]
  })
};