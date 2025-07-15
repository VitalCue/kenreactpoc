import type {
  WorkoutSessionAdapter,
  WorkoutSegmentAdapter,
  WorkoutLapAdapter,
  AndroidWorkoutData
} from '../../types';
import { WorkoutExerciseType } from '../../constants';
import type { RawExerciseSessionRecord } from './types';
import { HEALTH_CONNECT_EXERCISE_TYPE_MAP } from './types';

/**
 * Converts raw Health Connect ExerciseSessionRecord to unified WorkoutSessionAdapter
 */
export function adaptHealthConnectWorkout(raw: RawExerciseSessionRecord): WorkoutSessionAdapter {
  const exerciseType = HEALTH_CONNECT_EXERCISE_TYPE_MAP[raw.exerciseType] || WorkoutExerciseType.OTHER;
  const duration = (new Date(raw.endDate).getTime() - new Date(raw.startDate).getTime()) / 1000;
  
  return {
    // HealthDataAdapter fields
    uuid: raw.uuid,
    deviceManf: 'Android', // Health Connect doesn't provide device info
    deviceModel: 'Unknown',
    dataType: 'workoutSession',
    startDate: raw.startDate,
    endDate: raw.endDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: duration,
    unit: 'seconds',
    dataOrigin: raw.dataOrigin,
    
    // WorkoutSessionAdapter fields
    exerciseType,
    title: raw.title,
    notes: raw.notes,
    duration,
    
    // Sub-components
    segments: raw.segments?.map(adaptHealthConnectSegment),
    laps: raw.laps?.map(adaptHealthConnectLap),
    route: raw.route ? {
      startDate: raw.startDate,
      endDate: raw.endDate,
      locations: raw.route.map(location => ({
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude,
        speed: location.speed,
        course: location.bearing,
        timestamp: location.time,
        accuracy: location.accuracy
      }))
    } : undefined,
    
    // Platform-specific data
    platformData: {
      platform: 'android',
      data: {
        metadata: raw.metadata,
        exerciseRouteResult: raw.route ? {
          routeId: raw.uuid,
          locations: raw.route.map(location => ({
            latitude: location.latitude,
            longitude: location.longitude,
            altitude: location.altitude,
            bearing: location.bearing,
            speed: location.speed,
            time: location.time,
            accuracy: location.accuracy
          }))
        } : undefined,
        segments: raw.segments?.map(segment => ({
          startTime: segment.startDate,
          endTime: segment.endDate,
          segmentType: segment.segmentType || 'unknown',
          repeatCount: segment.repeatCount
        }))
      } satisfies AndroidWorkoutData
    }
  };
}

/**
 * Converts Health Connect segment to unified format
 */
export function adaptHealthConnectSegment(segment: { 
  startDate: string; 
  endDate: string; 
  exerciseType: string; 
  segmentType?: string; 
}): WorkoutSegmentAdapter {
  const exerciseType = HEALTH_CONNECT_EXERCISE_TYPE_MAP[segment.exerciseType] || WorkoutExerciseType.OTHER;
  const duration = (new Date(segment.endDate).getTime() - new Date(segment.startDate).getTime()) / 1000;
  
  return {
    startDate: segment.startDate,
    endDate: segment.endDate,
    exerciseType,
    duration,
    metadata: segment.segmentType ? { segmentType: segment.segmentType } : undefined
  };
}

/**
 * Converts Health Connect lap to unified format
 */
export function adaptHealthConnectLap(lap: { 
  startDate: string; 
  endDate?: string; 
  length?: number; 
}, index?: number): WorkoutLapAdapter {
  return {
    startDate: lap.startDate,
    lapNumber: index ? index + 1 : undefined,
    distance: lap.length,
    duration: lap.endDate ? (new Date(lap.endDate).getTime() - new Date(lap.startDate).getTime()) / 1000 : undefined
  };
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
    new Date(raw.startDate).getTime() < new Date(raw.endDate).getTime()
  );
}