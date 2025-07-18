// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH TYPES - MAIN INDEX
// ═══════════════════════════════════════════════════════════════════════════════

// Core types
export * from './base';
export * from './auth';
export * from './service';
export * from './query';
export * from './workout';

// Platform-specific types
export * from './platform';

// Filter types
export * from './filters';

// Re-export commonly used types for convenience
export type { 
  HealthDataAdapter, 
  PlatformSpecificData, 
  IOSHealthData, 
  AndroidHealthData 
} from './base';

export { 
  AuthorizationRequestStatus, 
  AuthorizationStatus 
} from './auth';

export type { 
  HealthServiceHook 
} from './service';

export type { 
  QueryParams 
} from './query';

export type { 
  FilterForSamples, 
  PredicateForSamples 
} from './filters';

export { 
  Filters 
} from './filters';