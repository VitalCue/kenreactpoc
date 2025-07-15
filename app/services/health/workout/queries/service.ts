import type { HealthServiceHook, WorkoutMetricRecord, WorkoutMetricDataType } from '../../types';
import type { 
  WorkoutQueryParams, 
  WorkoutMetricQueryParams, 
  WorkoutQueryResult, 
  CompositeWorkoutQueryResult 
} from '../types/queries';
import type { WorkoutStatsResult, WorkoutTypeSummary } from '../types/statistics';
import type { WorkoutSessionAdapter, CompositeWorkoutAdapter } from '../types/base';
import type { WorkoutExerciseType } from '../constants';

/**
 * Enhanced health service interface with workout-specific methods
 */
export interface WorkoutHealthService extends HealthServiceHook {
  // ── Basic workout queries ──────────────────────────────────────────────────
  
  /**
   * Query workout sessions
   */
  getWorkoutSessions(params: WorkoutQueryParams): Promise<WorkoutQueryResult>;
  
  /**
   * Get a single workout session by ID
   */
  getWorkoutSession(workoutId: string, params?: Partial<WorkoutQueryParams>): Promise<WorkoutSessionAdapter | null>;
  
  /**
   * Query workout-related metrics
   */
  getWorkoutMetrics(params: WorkoutMetricQueryParams): Promise<Record<WorkoutMetricDataType, WorkoutMetricRecord[]>>;
  
  // ── Composite workout queries ──────────────────────────────────────────────
  
  /**
   * Query composite workouts (sessions + metrics combined)
   */
  getCompositeWorkouts(params: WorkoutQueryParams): Promise<CompositeWorkoutQueryResult>;
  
  /**
   * Get a single composite workout by ID
   */
  getCompositeWorkout(workoutId: string, params?: Partial<WorkoutQueryParams>): Promise<CompositeWorkoutAdapter | null>;
  
  // ── Aggregation & statistics ────────────────────────────────────────────────
  
  /**
   * Get workout statistics for a time period
   */
  getWorkoutStats(params: WorkoutQueryParams & { 
    groupBy?: 'day' | 'week' | 'month' | 'year';
    includeAvg?: boolean;
    includeMax?: boolean;
    includeTotal?: boolean;
  }): Promise<WorkoutStatsResult>;
  
  /**
   * Get workout summaries by exercise type
   */
  getWorkoutSummariesByType(params: WorkoutQueryParams): Promise<Record<WorkoutExerciseType, WorkoutTypeSummary>>;
  
  // ── Real-time & streaming ───────────────────────────────────────────────────
  
  /**
   * Stream workout data in real-time (for active workouts)
   */
  streamWorkoutData?(
    callback: (data: {
      metrics: WorkoutMetricRecord[];
      location?: { latitude: number; longitude: number };
    }) => void
  ): Promise<() => void>; // Returns cleanup function
  
  // ── Platform-specific queries ──────────────────────────────────────────────
  
  /**
   * Get platform-specific workout data
   */
  getPlatformWorkoutData?<T = any>(
    workoutId: string,
    params?: Record<string, any>
  ): Promise<T | null>;
}