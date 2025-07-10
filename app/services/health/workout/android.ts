import type { AnyMap } from 'react-native-nitro-modules';
import type {
  WorkoutSessionAdapter,
  WorkoutSegmentAdapter,
  WorkoutLapAdapter,
  WorkoutRouteAdapter,
  WorkoutLocationAdapter,
  MetricRecordAdapter,
  HeartRateRecordAdapter,
  DistanceRecordAdapter,
  ActiveCaloriesRecordAdapter,
  SpeedRecordAdapter,
  StepCountRecordAdapter,
  PowerRecordAdapter,
  CadenceRecordAdapter,
  CompositeWorkoutAdapter,
  AndroidWorkoutData
} from './types';

import {
  WorkoutExerciseType
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// RAW HEALTH CONNECT TYPES (from your provided structure)
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
// EXERCISE TYPE MAPPING
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
  'FOOTBALL_AUSTRALIAN': WorkoutExerciseType.FOOTBALL,
  'SOCCER': WorkoutExerciseType.SOCCER,
  'BASEBALL': WorkoutExerciseType.BASEBALL,
  'GOLF': WorkoutExerciseType.GOLF,
  'HIKING': WorkoutExerciseType.HIKING,
  'DANCING': WorkoutExerciseType.DANCING,
  'MARTIAL_ARTS': WorkoutExerciseType.MARTIAL_ARTS,
  'BOXING': WorkoutExerciseType.BOXING,
  'ROCK_CLIMBING': WorkoutExerciseType.CLIMBING,
  'OTHER': WorkoutExerciseType.OTHER
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Converts raw Health Connect ExerciseSessionRecord to unified WorkoutSessionAdapter
 */
export function adaptHealthConnectWorkoutSession(
  raw: RawExerciseSessionRecord,
  deviceInfo?: { manufacturer: string; model: string }
): WorkoutSessionAdapter {
  const startDate = new Date(raw.startDate);
  const endDate = new Date(raw.endDate);
  const duration = (endDate.getTime() - startDate.getTime()) / 1000;
  
  return {
    // HealthDataAdapter fields
    uuid: raw.uuid,
    deviceManf: deviceInfo?.manufacturer || 'Unknown',
    deviceModel: deviceInfo?.model || 'Unknown',
    dataType: 'workoutSession',
    startDate: raw.startDate,
    endDate: raw.endDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: duration,
    unit: 'seconds',
    dataOrigin: raw.dataOrigin,
    
    // WorkoutSessionAdapter fields
    exerciseType: HEALTH_CONNECT_EXERCISE_TYPE_MAP[raw.exerciseType] || WorkoutExerciseType.OTHER,
    title: raw.title,
    notes: raw.notes,
    duration,
    
    // Sub-components
    segments: raw.segments?.map(adaptHealthConnectSegment),
    laps: raw.laps?.map(adaptHealthConnectLap),
    route: raw.route ? adaptHealthConnectRoute(raw.route, raw.startDate, raw.endDate) : undefined,
    
    // Platform-specific data
    platformData: {
      platform: 'android',
      data: {
        metadata: raw.metadata,
        segments: raw.segments?.map(seg => ({
          startTime: seg.startDate,
          endTime: seg.endDate,
          segmentType: seg.segmentType || 'interval',
          repeatCount: seg.repeatCount
        }))
      } satisfies AndroidWorkoutData
    }
  };
}

/**
 * Converts Health Connect segment to unified format
 */
function adaptHealthConnectSegment(segment: RawExerciseSegment): WorkoutSegmentAdapter {
  const startDate = new Date(segment.startDate);
  const endDate = new Date(segment.endDate);
  const duration = (endDate.getTime() - startDate.getTime()) / 1000;
  
  return {
    startDate: segment.startDate,
    endDate: segment.endDate,
    exerciseType: HEALTH_CONNECT_EXERCISE_TYPE_MAP[segment.exerciseType] || WorkoutExerciseType.OTHER,
    duration,
    metadata: {
      segmentType: segment.segmentType,
      repeatCount: segment.repeatCount
    } as AnyMap
  };
}

/**
 * Converts Health Connect lap to unified format
 */
function adaptHealthConnectLap(lap: RawExerciseLap, index: number): WorkoutLapAdapter {
  return {
    startDate: lap.startDate,
    lapNumber: index + 1,
    distance: lap.length,
    duration: lap.endDate ? (new Date(lap.endDate).getTime() - new Date(lap.startDate).getTime()) / 1000 : undefined
  };
}

/**
 * Converts Health Connect route to unified format
 */
function adaptHealthConnectRoute(
  routePoints: RawExerciseRoute[], 
  startDate: string, 
  endDate: string
): WorkoutRouteAdapter {
  return {
    startDate,
    endDate,
    locations: routePoints.map(adaptHealthConnectLocation)
  };
}

/**
 * Converts Health Connect location to unified format
 */
function adaptHealthConnectLocation(location: RawExerciseRoute): WorkoutLocationAdapter {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    altitude: location.altitude,
    speed: location.speed,
    course: location.bearing,
    timestamp: location.time,
    accuracy: location.accuracy
  };
}

/**
 * Converts raw Health Connect metric to unified MetricRecordAdapter
 */
export function adaptHealthConnectMetric(
  raw: RawHealthConnectMetric,
  deviceInfo?: { manufacturer: string; model: string }
): MetricRecordAdapter {
  const baseAdapter = {
    uuid: raw.uuid,
    deviceManf: deviceInfo?.manufacturer || 'Unknown',
    deviceModel: deviceInfo?.model || 'Unknown',
    startDate: raw.startDate,
    endDate: raw.endDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: raw.amount,
    unit: raw.unit,
    dataOrigin: raw.dataOrigin,
    platformData: {
      platform: 'android' as const,
      data: {
        metadata: raw.metadata,
        dataPointType: raw.dataType,
        originalDataFormat: 'health_connect'
      }
    }
  };
  
  // Map to specific metric type based on dataType
  switch (raw.dataType) {
    case 'HeartRate':
      return {
        ...baseAdapter,
        dataType: 'heartRate',
        unit: 'bpm'
      } as HeartRateRecordAdapter;
      
    case 'Distance':
      return {
        ...baseAdapter,
        dataType: 'distance',
        unit: 'm'
      } as DistanceRecordAdapter;
      
    case 'ActiveCaloriesBurned':
      return {
        ...baseAdapter,
        dataType: 'activeCalories',
        unit: 'kcal'
      } as ActiveCaloriesRecordAdapter;
      
    case 'Speed':
      return {
        ...baseAdapter,
        dataType: 'speed',
        unit: 'm/s'
      } as SpeedRecordAdapter;
      
    case 'StepCount':
      return {
        ...baseAdapter,
        dataType: 'stepCount',
        unit: 'count'
      } as StepCountRecordAdapter;
      
    case 'Power':
      return {
        ...baseAdapter,
        dataType: 'power',
        unit: 'W'
      } as PowerRecordAdapter;
      
    case 'CyclingPedalingCadence':
    case 'RunningStrideLength':
      return {
        ...baseAdapter,
        dataType: 'cadence',
        unit: raw.dataType === 'CyclingPedalingCadence' ? 'rpm' : 'spm'
      } as CadenceRecordAdapter;
      
    default:
      return {
        ...baseAdapter,
        dataType: raw.dataType as any
      } as MetricRecordAdapter;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSITE WORKOUT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Combines workout session with related metrics into a composite object
 */
export function buildCompositeWorkoutFromHealthConnect(
  session: WorkoutSessionAdapter,
  metrics: {
    heartRate?: HeartRateRecordAdapter[];
    distance?: DistanceRecordAdapter[];
    activeCalories?: ActiveCaloriesRecordAdapter[];
    speed?: SpeedRecordAdapter[];
    stepCount?: StepCountRecordAdapter[];
    power?: PowerRecordAdapter[];
    cadence?: CadenceRecordAdapter[];
  }
): CompositeWorkoutAdapter {
  // Calculate aggregated values
  const totalDistance = metrics.distance?.reduce((sum, record) => sum + record.amount, 0);
  const totalCalories = metrics.activeCalories?.reduce((sum, record) => sum + record.amount, 0);
  
  const heartRates = metrics.heartRate?.map(r => r.amount) || [];
  const speeds = metrics.speed?.map(r => r.amount) || [];
  const powers = metrics.power?.map(r => r.amount) || [];
  const cadences = metrics.cadence?.map(r => r.amount) || [];
  
  const avgHeartRate = heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : undefined;
  const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : undefined;
  const minHeartRate = heartRates.length > 0 ? Math.min(...heartRates) : undefined;
  
  const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : undefined;
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : undefined;
  
  const avgPower = powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : undefined;
  const maxPower = powers.length > 0 ? Math.max(...powers) : undefined;
  
  const avgCadence = cadences.length > 0 ? cadences.reduce((a, b) => a + b, 0) / cadences.length : undefined;
  
  return {
    session,
    totalDistanceMeters: totalDistance,
    totalActiveCalories: totalCalories,
    totalDurationSeconds: session.duration,
    
    avgHeartRate,
    maxHeartRate,
    minHeartRate,
    
    avgSpeed,
    maxSpeed,
    avgPower,
    maxPower,
    avgCadence,
    
    heartRateRecords: metrics.heartRate,
    distanceRecords: metrics.distance,
    speedRecords: metrics.speed,
    powerRecords: metrics.power,
    cadenceRecords: metrics.cadence
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maps Health Connect data type to unified metric type
 */
export function mapHealthConnectDataType(dataType: string): string {
  const mapping: Record<string, string> = {
    'HeartRate': 'heartRate',
    'Distance': 'distance',
    'ActiveCaloriesBurned': 'activeCalories',
    'Speed': 'speed',
    'StepCount': 'stepCount',
    'Power': 'power',
    'CyclingPedalingCadence': 'cadence',
    'RunningStrideLength': 'cadence'
  };
  
  return mapping[dataType] || dataType.toLowerCase();
}

/**
 * Validates Health Connect workout data
 */
export function validateHealthConnectWorkout(raw: RawExerciseSessionRecord): boolean {
  return !!(
    raw.uuid &&
    raw.startDate &&
    raw.endDate &&
    raw.exerciseType &&
    raw.dataOrigin &&
    new Date(raw.startDate).getTime() < new Date(raw.endDate).getTime()
  );
}

/**
 * Filters metrics by workout time range
 */
export function filterMetricsByWorkoutTime(
  metrics: MetricRecordAdapter[],
  workoutStart: string,
  workoutEnd: string
): MetricRecordAdapter[] {
  const startTime = new Date(workoutStart).getTime();
  const endTime = new Date(workoutEnd).getTime();
  
  return metrics.filter(metric => {
    const metricTime = new Date(metric.startDate).getTime();
    return metricTime >= startTime && metricTime <= endTime;
  });
}