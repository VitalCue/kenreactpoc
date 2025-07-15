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
  
  // High Intensity
  HIGH_INTENSITY_INTERVAL_TRAINING = 'high_intensity_interval_training',
  
  OTHER = 'other',
  UNKNOWN = 'unknown'
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