import type { AnyMap } from 'react-native-nitro-modules';
import type { 
  IOSDevice, 
  IOSSourceRevision, 
  AndroidDataCollector 
} from '../../types';

/**
 * Platform-specific workout data discriminated union
 */
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