// ═══════════════════════════════════════════════════════════════════════════════
// WORKOUT HEALTH SERVICES - INDEX
// ═══════════════════════════════════════════════════════════════════════════════

// ── Core Types & Constants ─────────────────────────────────────────────────────
export * from './constants';

// ── Platform Adapters ──────────────────────────────────────────────────────────
export * from './adapters';

// ── Query System ───────────────────────────────────────────────────────────────
export * from './queries';

// ── Utilities ──────────────────────────────────────────────────────────────────
// export * from './utils'; // Commented to avoid conflicts

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

import { WorkoutExerciseType } from './constants';
import type { MetricRecordAdapter } from './types';

/**
 * Platform-agnostic workout adapter selector
 */
export function createWorkoutAdapter(platform: 'ios' | 'android') {
  if (platform === 'ios') {
    const { 
      adaptHealthKitWorkout, 
      adaptHealthKitQuantitySample, 
      buildCompositeWorkoutFromHealthKit,
      validateHealthKitWorkout 
    } = require('./adapters/ios');
    
    return {
      adaptWorkoutSession: adaptHealthKitWorkout,
      adaptMetric: adaptHealthKitQuantitySample,
      buildComposite: buildCompositeWorkoutFromHealthKit,
      validate: validateHealthKitWorkout
    };
  } else {
    const { 
      adaptHealthConnectWorkout, 
      adaptHealthConnectMetric,
      validateHealthConnectWorkout 
    } = require('./adapters/android');
    
    return {
      adaptWorkoutSession: adaptHealthConnectWorkout,
      adaptMetric: adaptHealthConnectMetric,
      buildComposite: undefined, // Android composite builder not implemented yet
      validate: validateHealthConnectWorkout
    };
  }
}

/**
 * Get platform-specific exercise type mappings
 */
export function getExerciseTypeMap(platform: 'ios' | 'android') {
  if (platform === 'ios') {
    const { HEALTHKIT_ACTIVITY_TYPE_MAP } = require('./adapters/ios');
    return HEALTHKIT_ACTIVITY_TYPE_MAP;
  } else {
    const { HEALTH_CONNECT_EXERCISE_TYPE_MAP } = require('./adapters/android');
    return HEALTH_CONNECT_EXERCISE_TYPE_MAP;
  }
}

/**
 * Universal metric filter function
 */
export function filterMetricsByWorkoutTime(
  metrics: MetricRecordAdapter[],
  workoutStart: string,
  workoutEnd: string,
  platform?: 'ios' | 'android'
): MetricRecordAdapter[] {
  // Use the iOS implementation as it's more comprehensive
  const { filterMetricsByWorkoutTime: iosFilter } = require('./adapters/ios');
  return iosFilter(metrics, workoutStart, workoutEnd);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXERCISE TYPE COLLECTIONS
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
  WorkoutExerciseType.ELLIPTICAL,
  WorkoutExerciseType.STAIR_CLIMBING
] as const;

/**
 * Strength training exercise types
 */
export const STRENGTH_EXERCISE_TYPES = [
  WorkoutExerciseType.STRENGTH_TRAINING,
  WorkoutExerciseType.WEIGHTLIFTING,
  WorkoutExerciseType.BODYWEIGHT,
  WorkoutExerciseType.YOGA,
  WorkoutExerciseType.PILATES
] as const;

/**
 * Sport exercise types
 */
export const SPORT_EXERCISE_TYPES = [
  WorkoutExerciseType.TENNIS,
  WorkoutExerciseType.BASKETBALL,
  WorkoutExerciseType.FOOTBALL,
  WorkoutExerciseType.SOCCER,
  WorkoutExerciseType.BASEBALL,
  WorkoutExerciseType.GOLF
] as const;