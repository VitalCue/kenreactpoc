import type { 
  QueryParams, 
  FilterForSamples,
  WorkoutMetricRecord,
  WorkoutMetricDataType
} from '../../types';
import type { 
  WorkoutSessionAdapter, 
  CompositeWorkoutAdapter 
} from './base';
import type { WorkoutExerciseType } from '../constants';

/**
 * Workout-specific Android query options
 */
export interface WorkoutAndroidQueryOptions {
  /** Include exercise segments */
  includeSegments?: boolean;
  /** Include lap markers */
  includeLaps?: boolean;
  /** Include route data */
  includeRoute?: boolean;
  /** Data source package names */
  dataSourcePackages?: string[];
}

/**
 * Workout-specific iOS query options
 */
export interface WorkoutIOSQueryOptions {
  /** Include workout events */
  includeWorkoutEvents?: boolean;
  /** Include route data */
  includeRoute?: boolean;
  /** Sort order */
  ascending?: boolean;
  /** Additional HealthKit filters */
  additionalFilters?: FilterForSamples;
}

/**
 * Specialized query parameters for workout sessions
 */
export interface WorkoutQueryParams extends Omit<QueryParams, 'android' | 'ios'> {
  /** Filter by exercise types */
  exerciseTypes?: WorkoutExerciseType[];
  
  /** Minimum duration in seconds */
  minDuration?: number;
  
  /** Maximum duration in seconds */
  maxDuration?: number;
  
  /** Filter by data origin (app bundle ID) */
  dataOrigins?: string[];
  
  /** Include GPS route data */
  includeRoute?: boolean;
  
  /** Include workout events (laps, pauses, etc.) */
  includeEvents?: boolean;
  
  /** Include associated metrics */
  includeMetrics?: boolean;
  
  /** Specific metrics to include */
  metricTypes?: WorkoutMetricDataType[];
  
  /** Platform-specific extensions */
  ios?: QueryParams['ios'] & WorkoutIOSQueryOptions;
  
  android?: QueryParams['android'] & WorkoutAndroidQueryOptions;
}

/**
 * Query parameters for workout-related metrics
 */
export interface WorkoutMetricQueryParams extends QueryParams {
  /** Associated workout UUID */
  workoutId?: string;
  
  /** Metric types to query */
  metricTypes: WorkoutMetricDataType[];
  
  /** Sample rate (e.g., every 5 seconds) */
  sampleRate?: number;
  
  /** Aggregation type */
  aggregation?: 'raw' | 'minute' | 'hour' | 'session';
  
  /** Statistical calculations */
  includeStats?: boolean;
}

/**
 * Query results for workout sessions
 */
export interface WorkoutQueryResult {
  /** Workout sessions */
  sessions: WorkoutSessionAdapter[];
  
  /** Associated metrics (if requested) */
  metrics?: Record<string, WorkoutMetricRecord[]>;
  
  /** Pagination info */
  pagination?: {
    hasMore: boolean;
    nextCursor?: string;
    total?: number;
  };
  
  /** Query metadata */
  metadata: {
    queryTime: number;
    platform: 'ios' | 'android';
    dataTypes: string[];
  };
}

/**
 * Query results for composite workouts
 */
export interface CompositeWorkoutQueryResult {
  /** Composite workout data */
  workouts: CompositeWorkoutAdapter[];
  
  /** Pagination info */
  pagination?: {
    hasMore: boolean;
    nextCursor?: string;
    total?: number;
  };
  
  /** Query metadata */
  metadata: {
    queryTime: number;
    platform: 'ios' | 'android';
    metricsIncluded: WorkoutMetricDataType[];
  };
}