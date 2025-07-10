import type { 
  WorkoutSessionAdapter, 
  CompositeWorkoutAdapter
} from './types';
import type {
  WorkoutMetricRecord,
  WorkoutMetricDataType
} from '../types';
import { WorkoutExerciseType } from './types';
import type { 
  QueryParams, 
  FilterForSamples, 
  HealthServiceHook 
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// WORKOUT QUERY INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// WORKOUT SERVICE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY BUILDERS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// PREBUILT QUERY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

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