import type { AnyMap } from 'react-native-nitro-modules';
import type { 
  HealthDataAdapter, 
  IOSDevice, 
  IOSSourceRevision, 
  AndroidDataCollector 
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED WORKOUT ADAPTERS
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// METRIC RECORDS (Heart Rate, Distance, etc.)
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSITE WORKOUT DATA
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// PLATFORM-SPECIFIC EXTENSIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type WorkoutPlatformData = 
  | { platform: 'ios'; data: IOSWorkoutData }
  | { platform: 'android'; data: AndroidWorkoutData };

/**
 * iOS-specific workout data (from HealthKit)
 */
export interface IOSWorkoutData {
  readonly device?: IOSDevice;
  readonly sourceRevision?: IOSSourceRevision;
  readonly metadata?: AnyMap;
  readonly activityType: number; // HKWorkoutActivityType rawValue
  readonly workoutEvents?: IOSWorkoutEvent[];
  readonly totalSwimmingStrokeCount?: number;
  readonly totalFlightsClimbed?: number;
}

export interface IOSWorkoutEvent {
  readonly type: number; // HKWorkoutEventType rawValue
  readonly date: string;
  readonly duration?: number;
  readonly metadata?: AnyMap;
}

/**
 * Android-specific workout data (from Health Connect)
 */
export interface AndroidWorkoutData {
  readonly metadata?: AnyMap;
  readonly dataCollector?: AndroidDataCollector;
  readonly exerciseRouteResult?: AndroidExerciseRoute;
  readonly segments?: AndroidWorkoutSegment[];
}

export interface AndroidExerciseRoute {
  readonly routeId: string;
  readonly locations: AndroidLocationData[];
}

export interface AndroidLocationData {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude?: number;
  readonly bearing?: number;
  readonly speed?: number;
  readonly time: string;
  readonly accuracy?: number;
}

export interface AndroidWorkoutSegment {
  readonly startTime: string;
  readonly endTime: string;
  readonly segmentType: string;
  readonly repeatCount?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Unified exercise types (mapped from platform-specific values)
 */
export enum WorkoutExerciseType {
  // Cardio
  RUNNING = 'running',
  WALKING = 'walking',
  CYCLING = 'cycling',
  SWIMMING = 'swimming',
  ROWING = 'rowing',
  ELLIPTICAL = 'elliptical',
  STAIR_CLIMBING = 'stair_climbing',
  
  // Strength
  STRENGTH_TRAINING = 'strength_training',
  WEIGHTLIFTING = 'weightlifting',
  BODYWEIGHT = 'bodyweight',
  YOGA = 'yoga',
  PILATES = 'pilates',
  
  // Sports
  TENNIS = 'tennis',
  BASKETBALL = 'basketball',
  FOOTBALL = 'football',
  SOCCER = 'soccer',
  BASEBALL = 'baseball',
  GOLF = 'golf',
  
  // Other
  HIKING = 'hiking',
  DANCING = 'dancing',
  MARTIAL_ARTS = 'martial_arts',
  BOXING = 'boxing',
  CLIMBING = 'climbing',
  OTHER = 'other'
}

/**
 * Workout event types
 */
export enum WorkoutEventType {
  PAUSE = 'pause',
  RESUME = 'resume',
  LAP = 'lap',
  SEGMENT = 'segment',
  MARKER = 'marker'
}

/**
 * Workout-related metric types
 */
export type WorkoutMetricType = 
  | 'heartRate'
  | 'distance'
  | 'activeCalories'
  | 'speed'
  | 'stepCount'
  | 'power'
  | 'cadence'
  | 'elevation'
  | 'temperature';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE UNIONS FOR CONVENIENCE
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════════

export const isWorkoutSession = (
  data: HealthDataAdapter
): data is WorkoutSessionAdapter => {
  return data.dataType === 'workoutSession';
};

export const isMetricRecord = (
  data: HealthDataAdapter
): data is MetricRecordAdapter => {
  return ['heartRate', 'distance', 'activeCalories', 'speed', 'stepCount', 'power', 'cadence'].includes(data.dataType);
};

export const isHeartRateRecord = (
  data: HealthDataAdapter
): data is HeartRateRecordAdapter => {
  return data.dataType === 'heartRate';
};

export const isDistanceRecord = (
  data: HealthDataAdapter
): data is DistanceRecordAdapter => {
  return data.dataType === 'distance';
};

export const isIOSWorkoutData = (
  data: WorkoutPlatformData
): data is { platform: 'ios'; data: IOSWorkoutData } => {
  return data.platform === 'ios';
};

export const isAndroidWorkoutData = (
  data: WorkoutPlatformData
): data is { platform: 'android'; data: AndroidWorkoutData } => {
  return data.platform === 'android';
};