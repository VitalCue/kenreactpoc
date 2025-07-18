// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH SERVICES - INDEX
// ═══════════════════════════════════════════════════════════════════════════════

// ── Core Health System ─────────────────────────────────────────────────────────
export * from './core';
export * from './service';
export * from './types';

// Platform-specific exports commented out to avoid duplicates
// export * from './platforms';

// ── Query System ───────────────────────────────────────────────────────────────
export * from './queries';

// ── Utilities ──────────────────────────────────────────────────────────────────
export * from './utils';

// Workout module exports commented out to avoid duplicates
// export * from './workout';

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Main service hook
export { useHealthService } from './service';

// Platform-specific services
export { 
  useIOSHealthService, 
  useAndroidHealthService,
  getPlatformHealthService 
} from './service';

// Essential utilities
export { 
  HealthDataFetchers, 
  HealthDataAggregators, 
  getHealthSummary 
} from './utils/aggregation';
export { HealthDataFormatters } from './utils/formatters';
export { HealthDataValidators } from './utils/validators';

// Query builders
export { 
  Filters, 
  HealthQueries, 
  createHealthQuery,
  HealthQueryBuilder 
} from './queries';

// Core types are now exported from './types' above

// Health data constants
export { 
  HEALTH_DATA_TYPES, 
  HEALTH_UNITS, 
  DEFAULT_PAGE_SIZES 
} from './core/constants';