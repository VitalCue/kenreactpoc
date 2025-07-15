import type {
  PredicateWithUUID,
  PredicateWithUUIDs,
  PredicateWithMetadataKey,
  PredicateWithStartAndEnd,
  PredicateFromWorkout,
  PredicateForSamples,
  FilterForSamples,
  FilterForSamplesAnd,
  FilterForSamplesOr
} from './types';

/**
 * Filter builder helpers for iOS HealthKit queries
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
  and: (...predicates: FilterForSamples[]): FilterForSamplesAnd => ({ AND: predicates }),
  or: (...predicates: FilterForSamples[]): FilterForSamplesOr => ({ OR: predicates }),
  
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
  
  lastWeek: (): PredicateWithStartAndEnd => {
    return Filters.lastDays(7);
  },
  
  lastMonth: (): PredicateWithStartAndEnd => {
    return Filters.lastDays(30);
  },
  
  excludeManualEntries: (): FilterForSamplesOr => ({
    OR: [
      { withMetadataKey: 'HKMetadataKeyDeviceSerialNumber' },
      { withMetadataKey: 'HKMetadataKeyDigitallySigned' }
    ]
  }),
  
  // Date range helpers
  thisWeek: (): PredicateWithStartAndEnd => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startDate: startOfWeek, endDate: endOfWeek };
  },
  
  thisMonth: (): PredicateWithStartAndEnd => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    return { startDate: startOfMonth, endDate: endOfMonth };
  }
};