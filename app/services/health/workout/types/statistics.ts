import type { WorkoutExerciseType } from '../constants';

/**
 * Workout statistics result
 */
export interface WorkoutStatsResult {
  /** Time period */
  period: {
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month' | 'year';
  };
  
  /** Statistics by time bucket */
  buckets: WorkoutStatsBucket[];
  
  /** Overall totals */
  totals: {
    totalWorkouts: number;
    totalDuration: number; // seconds
    totalDistance?: number; // meters
    totalCalories?: number; // kcal
    avgDuration?: number; // seconds
  };
  
  /** Breakdown by exercise type */
  byExerciseType: Record<WorkoutExerciseType, {
    count: number;
    totalDuration: number;
    totalDistance?: number;
    totalCalories?: number;
  }>;
}

/**
 * Individual statistics bucket
 */
export interface WorkoutStatsBucket {
  /** Bucket identifier */
  bucket: string; // ISO date string
  
  /** Workout count */
  count: number;
  
  /** Total duration in seconds */
  totalDuration: number;
  
  /** Total distance in meters */
  totalDistance?: number;
  
  /** Total calories burned */
  totalCalories?: number;
  
  /** Average values */
  avgDuration?: number;
  avgDistance?: number;
  avgCalories?: number;
  
  /** Exercise type breakdown */
  byExerciseType: Record<WorkoutExerciseType, number>;
}

/**
 * Summary by exercise type
 */
export interface WorkoutTypeSummary {
  /** Exercise type */
  exerciseType: WorkoutExerciseType;
  
  /** Total workouts */
  totalWorkouts: number;
  
  /** Total duration */
  totalDuration: number; // seconds
  
  /** Total distance */
  totalDistance?: number; // meters
  
  /** Total calories */
  totalCalories?: number; // kcal
  
  /** Average values */
  avgDuration: number;
  avgDistance?: number;
  avgCalories?: number;
  
  /** Best performances */
  bestDuration?: number;
  bestDistance?: number;
  bestCalories?: number;
  
  /** Recent activity */
  lastWorkout?: string; // ISO date
  workoutsThisWeek: number;
  workoutsThisMonth: number;
}