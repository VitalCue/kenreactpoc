// ═══════════════════════════════════════════════════════════════════════════════
// WORKOUT HEALTH SERVICES - INDEX
// ═══════════════════════════════════════════════════════════════════════════════

// ── Core Types ──────────────────────────────────────────────────────────────────
export type {
  // Unified workout interfaces
  WorkoutSessionAdapter,
  WorkoutSegmentAdapter,
  WorkoutLapAdapter,
  WorkoutEventAdapter,
  WorkoutRouteAdapter,
  WorkoutLocationAdapter,
  
  // Metric interfaces
  MetricRecordAdapter,
  HeartRateRecordAdapter,
  DistanceRecordAdapter,
  ActiveCaloriesRecordAdapter,
  SpeedRecordAdapter,
  StepCountRecordAdapter,
  PowerRecordAdapter,
  CadenceRecordAdapter,
  
  // Composite & aggregated data
  CompositeWorkoutAdapter,
  HeartRateZone,
  
  // Platform-specific extensions
  WorkoutPlatformData,
  IOSWorkoutData,
  IOSWorkoutEvent,
  AndroidWorkoutData,
  AndroidWorkoutSegment,
  AndroidExerciseRoute,
  AndroidLocationData,
  
  // Type unions
  AnyWorkoutAdapter,
  AnyMetricRecordAdapter
} from './types';

// ── Enums ───────────────────────────────────────────────────────────────────────
export {
  WorkoutExerciseType,
  WorkoutEventType
} from './types';

export type {
  WorkoutMetricType
} from './types';

// ── Type Guards ─────────────────────────────────────────────────────────────────
export {
  isWorkoutSession,
  isMetricRecord,
  isHeartRateRecord,
  isDistanceRecord,
  isIOSWorkoutData,
  isAndroidWorkoutData
} from './types';

// ── Android/Health Connect Adapters ────────────────────────────────────────────
export type {
  RawExerciseSessionRecord,
  RawExerciseSegment,
  RawExerciseLap,
  RawExerciseRoute,
  RawHealthConnectMetric
} from './android';

export {
  HEALTH_CONNECT_EXERCISE_TYPE_MAP,
  adaptHealthConnectWorkoutSession,
  adaptHealthConnectMetric,
  buildCompositeWorkoutFromHealthConnect,
  mapHealthConnectDataType,
  validateHealthConnectWorkout,
  filterMetricsByWorkoutTime as filterMetricsByWorkoutTimeAndroid
} from './android';

// ── iOS/HealthKit Adapters ─────────────────────────────────────────────────────
export type {
  RawWorkout,
  RawWorkoutEvent,
  RawRoute,
  RawLocation,
  RawQuantitySample,
  RawActivitySummary
} from './ios';

export {
  HEALTHKIT_ACTIVITY_TYPE_MAP,
  HEALTHKIT_EVENT_TYPE_MAP,
  HEALTHKIT_QUANTITY_TYPES,
  adaptHealthKitWorkout,
  adaptHealthKitQuantitySample,
  buildCompositeWorkoutFromHealthKit,
  validateHealthKitWorkout,
  filterMetricsByWorkoutTime as filterMetricsByWorkoutTimeIOS,
  getDistanceQuantityTypeForActivity
} from './ios';

// ── Query Interfaces ────────────────────────────────────────────────────────────
export type {
  WorkoutQueryParams,
  WorkoutMetricQueryParams,
  WorkoutQueryResult,
  CompositeWorkoutQueryResult,
  WorkoutHealthService,
  WorkoutStatsResult,
  WorkoutStatsBucket,
  WorkoutTypeSummary
} from './queries';

export {
  WorkoutQueryBuilder,
  WorkoutQueries,
  createWorkoutQuery
} from './queries';

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Re-export commonly used types from base health services
export type {
  HealthDataAdapter,
  QueryParams,
  FilterForSamples,
  HealthServiceHook,
  IOSDevice,
  IOSSourceRevision,
  AndroidDataCollector
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Import types needed for utility functions
import type { MetricRecordAdapter } from './types';
import { WorkoutExerciseType } from './types';

/**
 * Platform-agnostic workout adapter selector
 */
export function createWorkoutAdapter(platform: 'ios' | 'android') {
  if (platform === 'ios') {
    return {
      adaptWorkoutSession: require('./ios').adaptHealthKitWorkout,
      adaptMetric: require('./ios').adaptHealthKitQuantitySample,
      buildComposite: require('./ios').buildCompositeWorkoutFromHealthKit,
      validate: require('./ios').validateHealthKitWorkout
    };
  } else {
    return {
      adaptWorkoutSession: require('./android').adaptHealthConnectWorkoutSession,
      adaptMetric: require('./android').adaptHealthConnectMetric,
      buildComposite: require('./android').buildCompositeWorkoutFromHealthConnect,
      validate: require('./android').validateHealthConnectWorkout
    };
  }
}

/**
 * Get platform-specific exercise type mappings
 */
export function getExerciseTypeMap(platform: 'ios' | 'android') {
  if (platform === 'ios') {
    return require('./ios').HEALTHKIT_ACTIVITY_TYPE_MAP;
  } else {
    return require('./android').HEALTH_CONNECT_EXERCISE_TYPE_MAP;
  }
}

/**
 * Universal metric filter function
 */
export function filterMetricsByWorkoutTime(
  metrics: MetricRecordAdapter[],
  workoutStart: string,
  workoutEnd: string,
  platform: 'ios' | 'android'
): MetricRecordAdapter[] {
  if (platform === 'ios') {
    return require('./ios').filterMetricsByWorkoutTime(metrics, workoutStart, workoutEnd);
  } else {
    return require('./android').filterMetricsByWorkoutTime(metrics, workoutStart, workoutEnd);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Common workout metric types for querying
 */
export const COMMON_WORKOUT_METRICS = [
  'heartRate',
  'distance',
  'activeCalories',
  'speed',
  'stepCount'
] as const;

/**
 * GPS-enabled exercise types
 */
export const GPS_EXERCISE_TYPES = [
  WorkoutExerciseType.RUNNING,
  WorkoutExerciseType.WALKING,
  WorkoutExerciseType.CYCLING,
  WorkoutExerciseType.HIKING
] as const;

/**
 * Cardio exercise types
 */
export const CARDIO_EXERCISE_TYPES = [
  WorkoutExerciseType.RUNNING,
  WorkoutExerciseType.WALKING,
  WorkoutExerciseType.CYCLING,
  WorkoutExerciseType.SWIMMING,
  WorkoutExerciseType.ROWING,
  WorkoutExerciseType.ELLIPTICAL
] as const;

/**
 * Strength training exercise types
 */
export const STRENGTH_EXERCISE_TYPES = [
  WorkoutExerciseType.STRENGTH_TRAINING,
  WorkoutExerciseType.WEIGHTLIFTING,
  WorkoutExerciseType.BODYWEIGHT
] as const;