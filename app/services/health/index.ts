// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH SERVICES - INDEX
// ═══════════════════════════════════════════════════════════════════════════════

// ── Core Health Service ────────────────────────────────────────────────────────
export { 
  useHealthService, 
  getPlatformHealthService,
  useIOSHealthService,
  useAndroidHealthService 
} from './service';

// ── Utilities ──────────────────────────────────────────────────────────────────
export * from './utils';

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  HealthDataAdapter,
  PlatformSpecificData,
  IOSHealthData,
  AndroidHealthData,
  IOSDevice,
  IOSSourceRevision,
  AndroidDataCollector,
  QueryParams,
  FilterForSamples,
  HealthServiceHook,
  AuthorizationRequestStatus,
  AuthorizationStatus
} from './types';

// ── Query Builders ─────────────────────────────────────────────────────────────
export { Filters } from './types';

// ── Workout Services ───────────────────────────────────────────────────────────
export * from './workout';