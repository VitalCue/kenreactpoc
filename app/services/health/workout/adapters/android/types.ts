import type { AnyMap } from 'react-native-nitro-modules';
import { WorkoutExerciseType } from '../../constants';

// ═══════════════════════════════════════════════════════════════════════════════
// RAW HEALTH CONNECT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Raw Health Connect ExerciseSessionRecord
 */
export interface RawExerciseSessionRecord {
  readonly uuid: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly exerciseType: string;
  readonly title?: string;
  readonly notes?: string;
  readonly segments?: RawExerciseSegment[];
  readonly laps?: RawExerciseLap[];
  readonly route?: RawExerciseRoute[];
  readonly metadata?: AnyMap;
  readonly dataOrigin: string;
}

export interface RawExerciseSegment {
  readonly startDate: string;
  readonly endDate: string;
  readonly exerciseType: string;
  readonly segmentType?: string;
  readonly repeatCount?: number;
}

export interface RawExerciseLap {
  readonly startDate: string;
  readonly endDate?: string;
  readonly length?: number; // meters
}

export interface RawExerciseRoute {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude?: number;
  readonly bearing?: number;
  readonly speed?: number;
  readonly time: string;
  readonly accuracy?: number;
}

/**
 * Raw Health Connect metric records
 */
export interface RawHealthConnectMetric {
  readonly uuid: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly dataType: string;
  readonly amount: number;
  readonly unit: string;
  readonly dataOrigin: string;
  readonly metadata?: AnyMap;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CONNECT CONSTANTS & MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maps Health Connect exercise types to unified types
 */
export const HEALTH_CONNECT_EXERCISE_TYPE_MAP: Record<string, WorkoutExerciseType> = {
  'RUNNING': WorkoutExerciseType.RUNNING,
  'WALKING': WorkoutExerciseType.WALKING,
  'CYCLING': WorkoutExerciseType.CYCLING,
  'SWIMMING_OPEN_WATER': WorkoutExerciseType.SWIMMING,
  'SWIMMING_POOL': WorkoutExerciseType.SWIMMING,
  'ROWING': WorkoutExerciseType.ROWING,
  'ELLIPTICAL': WorkoutExerciseType.ELLIPTICAL,
  'STAIR_CLIMBING': WorkoutExerciseType.STAIR_CLIMBING,
  'STRENGTH_TRAINING': WorkoutExerciseType.STRENGTH_TRAINING,
  'WEIGHTLIFTING': WorkoutExerciseType.WEIGHTLIFTING,
  'YOGA': WorkoutExerciseType.YOGA,
  'PILATES': WorkoutExerciseType.PILATES,
  'TENNIS': WorkoutExerciseType.TENNIS,
  'BASKETBALL': WorkoutExerciseType.BASKETBALL,
  'FOOTBALL_AMERICAN': WorkoutExerciseType.FOOTBALL,
  'FOOTBALL_AUSTRALIAN': WorkoutExerciseType.SOCCER,
  'SOCCER': WorkoutExerciseType.SOCCER,
  'BASEBALL': WorkoutExerciseType.BASEBALL,
  'GOLF': WorkoutExerciseType.GOLF,
  'HIKING': WorkoutExerciseType.HIKING,
  'DANCING': WorkoutExerciseType.DANCING,
  'MARTIAL_ARTS': WorkoutExerciseType.MARTIAL_ARTS,
  'BOXING': WorkoutExerciseType.BOXING,
  'ROCK_CLIMBING': WorkoutExerciseType.CLIMBING
};

/**
 * Health Connect data type mappings
 */
export const HEALTH_CONNECT_DATA_TYPES = {
  HEART_RATE: 'HeartRateRecord',
  DISTANCE: 'DistanceRecord',
  ACTIVE_CALORIES: 'ActiveCaloriesBurnedRecord',
  TOTAL_CALORIES: 'TotalCaloriesBurnedRecord',
  SPEED: 'SpeedRecord',
  STEPS: 'StepsRecord',
  POWER: 'PowerRecord',
  CYCLING_PEDALING_CADENCE: 'CyclingPedalingCadenceRecord'
} as const;