import type { WorkoutMetricDataType } from '../../types';
import type { WorkoutQueryParams } from '../types/queries';
import { WorkoutExerciseType } from '../constants';

/**
 * Workout query builder for easier query construction
 */
export class WorkoutQueryBuilder {
  private params: WorkoutQueryParams = {};
  
  /**
   * Set date range
   */
  dateRange(startDate: Date, endDate: Date): WorkoutQueryBuilder {
    this.params.startDate = startDate;
    this.params.endDate = endDate;
    return this;
  }
  
  /**
   * Filter by exercise types
   */
  exerciseTypes(...types: WorkoutExerciseType[]): WorkoutQueryBuilder {
    this.params.exerciseTypes = types;
    return this;
  }
  
  /**
   * Set duration range
   */
  durationRange(minSeconds: number, maxSeconds: number): WorkoutQueryBuilder {
    this.params.minDuration = minSeconds;
    this.params.maxDuration = maxSeconds;
    return this;
  }
  
  /**
   * Include GPS route data
   */
  includeRoute(include: boolean = true): WorkoutQueryBuilder {
    this.params.includeRoute = include;
    return this;
  }
  
  /**
   * Include workout events
   */
  includeEvents(include: boolean = true): WorkoutQueryBuilder {
    this.params.includeEvents = include;
    return this;
  }
  
  /**
   * Include metrics
   */
  includeMetrics(types?: WorkoutMetricDataType[]): WorkoutQueryBuilder {
    this.params.includeMetrics = true;
    if (types) {
      this.params.metricTypes = types;
    }
    return this;
  }
  
  /**
   * Set page size
   */
  limit(pageSize: number): WorkoutQueryBuilder {
    this.params.pageSize = pageSize;
    return this;
  }
  
  /**
   * iOS-specific options
   */
  ios(options: NonNullable<WorkoutQueryParams['ios']>): WorkoutQueryBuilder {
    this.params.ios = options;
    return this;
  }
  
  /**
   * Android-specific options
   */
  android(options: NonNullable<WorkoutQueryParams['android']>): WorkoutQueryBuilder {
    this.params.android = options;
    return this;
  }
  
  /**
   * Build the query parameters
   */
  build(): WorkoutQueryParams {
    return { ...this.params };
  }
}

/**
 * Common workout query presets
 */
export const WorkoutQueries = {
  /**
   * Get recent workouts (last 7 days)
   */
  recent: (limit: number = 20): WorkoutQueryParams => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    return {
      startDate,
      endDate,
      pageSize: limit,
      includeMetrics: true,
      includeEvents: true
    };
  },
  
  /**
   * Get workouts by exercise type
   */
  byType: (type: WorkoutExerciseType, days: number = 30): WorkoutQueryParams => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return {
      startDate,
      endDate,
      exerciseTypes: [type],
      includeMetrics: true,
      includeRoute: true
    };
  },
  
  /**
   * Get long workouts (>30 minutes)
   */
  longWorkouts: (days: number = 30): WorkoutQueryParams => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return {
      startDate,
      endDate,
      minDuration: 30 * 60, // 30 minutes
      includeMetrics: true,
      includeRoute: true
    };
  },
  
  /**
   * Get workouts with GPS data
   */
  withGPS: (days: number = 30): WorkoutQueryParams => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return {
      startDate,
      endDate,
      includeRoute: true,
      includeMetrics: true,
      exerciseTypes: [
        WorkoutExerciseType.RUNNING,
        WorkoutExerciseType.CYCLING,
        WorkoutExerciseType.WALKING,
        WorkoutExerciseType.HIKING
      ]
    };
  }
};

/**
 * Helper to create a workout query builder
 */
export const createWorkoutQuery = (): WorkoutQueryBuilder => {
  return new WorkoutQueryBuilder();
};