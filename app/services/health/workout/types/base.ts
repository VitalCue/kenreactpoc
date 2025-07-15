import type { AnyMap } from 'react-native-nitro-modules';
import type { HealthDataAdapter } from '../../types';
import type { WorkoutExerciseType, WorkoutEventType, WorkoutMetricType } from '../constants';
import type { WorkoutPlatformData } from './platform';

/**
 * Core workout session adapter - unified interface for both platforms
 */
export interface WorkoutSessionAdapter extends HealthDataAdapter {
  readonly dataType: 'workoutSession';
  
  /** Exercise type (unified enum values) */
  readonly exerciseType: WorkoutExerciseType;
  
  /** Optional metadata */
  readonly title?: string;
  readonly notes?: string;
  readonly duration: number; // seconds
  
  /** Aggregated totals */
  readonly totalDistance?: number; // meters
  readonly totalActiveCalories?: number; // kcal
  readonly totalEnergyBurned?: number; // kcal (alias for compatibility)
  readonly totalSteps?: number;
  readonly totalSwimmingStrokes?: number;
  readonly totalFlightsClimbed?: number;
  
  /** Sub-components */
  readonly segments?: WorkoutSegmentAdapter[];
  readonly laps?: WorkoutLapAdapter[];
  readonly events?: WorkoutEventAdapter[];
  readonly route?: WorkoutRouteAdapter;
  
  /** Platform-specific extensions */
  readonly platformData?: WorkoutPlatformData;
}

/**
 * Workout segment (intervals, warm-up, cool-down, etc.)
 */
export interface WorkoutSegmentAdapter {
  readonly startDate: string;
  readonly endDate: string;
  readonly exerciseType: WorkoutExerciseType;
  readonly duration: number; // seconds
  readonly metadata?: AnyMap;
}

/**
 * Workout lap marker
 */
export interface WorkoutLapAdapter {
  readonly startDate: string;
  readonly lapNumber?: number;
  readonly distance?: number; // meters
  readonly duration?: number; // seconds
  readonly metadata?: AnyMap;
}

/**
 * Workout events (pause, resume, segment, etc.)
 */
export interface WorkoutEventAdapter {
  readonly date: string;
  readonly type: WorkoutEventType;
  readonly duration?: number; // for pauses
  readonly metadata?: AnyMap;
}

/**
 * GPS route data
 */
export interface WorkoutRouteAdapter {
  readonly startDate: string;
  readonly endDate: string;
  readonly locations: WorkoutLocationAdapter[];
}

/**
 * Individual GPS location point
 */
export interface WorkoutLocationAdapter {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude?: number;
  readonly speed?: number; // m/s
  readonly course?: number; // degrees
  readonly timestamp: string;
  readonly accuracy?: number; // meters
}

/**
 * Base metric record adapter
 */
export interface MetricRecordAdapter extends HealthDataAdapter {
  readonly dataType: WorkoutMetricType;
  readonly amount: number;
  readonly unit: string;
  readonly associatedWorkout?: string; // workout UUID if linked
}

/**
 * Specific metric types with proper typing
 */
export interface HeartRateRecordAdapter extends MetricRecordAdapter {
  readonly dataType: 'heartRate';
  readonly unit: 'bpm';
}

export interface DistanceRecordAdapter extends MetricRecordAdapter {
  readonly dataType: 'distance';
  readonly unit: 'm';
}

export interface ActiveCaloriesRecordAdapter extends MetricRecordAdapter {
  readonly dataType: 'activeCalories';
  readonly unit: 'kcal';
}

export interface SpeedRecordAdapter extends MetricRecordAdapter {
  readonly dataType: 'speed';
  readonly unit: 'm/s';
}

export interface StepCountRecordAdapter extends MetricRecordAdapter {
  readonly dataType: 'stepCount';
  readonly unit: 'count';
}

export interface PowerRecordAdapter extends MetricRecordAdapter {
  readonly dataType: 'power';
  readonly unit: 'W';
}

export interface CadenceRecordAdapter extends MetricRecordAdapter {
  readonly dataType: 'cadence';
  readonly unit: 'rpm' | 'spm'; // revolutions/steps per minute
}

/**
 * Combines workout session with aggregated metrics for UI consumption
 */
export interface CompositeWorkoutAdapter {
  readonly session: WorkoutSessionAdapter;
  
  // Aggregated metrics
  readonly totalDistanceMeters?: number;
  readonly totalActiveCalories?: number;
  readonly totalDurationSeconds: number;
  
  // Heart rate stats
  readonly avgHeartRate?: number;
  readonly maxHeartRate?: number;
  readonly minHeartRate?: number;
  readonly heartRateZones?: HeartRateZone[];
  
  // Performance metrics
  readonly avgSpeed?: number; // m/s
  readonly maxSpeed?: number; // m/s
  readonly avgPower?: number; // W
  readonly maxPower?: number; // W
  readonly avgCadence?: number; // rpm/spm
  
  // Raw metric samples (for detailed analysis)
  readonly heartRateRecords?: HeartRateRecordAdapter[];
  readonly distanceRecords?: DistanceRecordAdapter[];
  readonly speedRecords?: SpeedRecordAdapter[];
  readonly powerRecords?: PowerRecordAdapter[];
  readonly cadenceRecords?: CadenceRecordAdapter[];
}

/**
 * Heart rate zone data
 */
export interface HeartRateZone {
  readonly zone: number; // 1-5
  readonly minBpm: number;
  readonly maxBpm: number;
  readonly timeInZone: number; // seconds
  readonly percentage: number; // 0-100
}

/**
 * All workout-related adapters
 */
export type AnyWorkoutAdapter = 
  | WorkoutSessionAdapter
  | MetricRecordAdapter
  | HeartRateRecordAdapter
  | DistanceRecordAdapter
  | ActiveCaloriesRecordAdapter
  | SpeedRecordAdapter
  | StepCountRecordAdapter
  | PowerRecordAdapter
  | CadenceRecordAdapter;

/**
 * All metric record types
 */
export type AnyMetricRecordAdapter = 
  | HeartRateRecordAdapter
  | DistanceRecordAdapter
  | ActiveCaloriesRecordAdapter
  | SpeedRecordAdapter
  | StepCountRecordAdapter
  | PowerRecordAdapter
  | CadenceRecordAdapter;