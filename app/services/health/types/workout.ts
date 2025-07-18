import type { HealthDataAdapter } from './base';

/**
 * Workout metric type unions that are properly assignable
 */
export type WorkoutMetricDataType = 
  | 'heartRate'
  | 'distance' 
  | 'activeCalories'
  | 'speed'
  | 'stepCount'
  | 'power'
  | 'cadence'
  | 'elevation'
  | 'temperature';

/**
 * Base metric record with proper typing
 */
export interface BaseMetricRecord extends HealthDataAdapter {
  readonly associatedWorkout?: string;
}

/**
 * Specific metric types with exact dataType values
 */
export interface HeartRateRecord extends BaseMetricRecord {
  readonly dataType: 'heartRate';
  readonly unit: 'bpm';
}

export interface DistanceRecord extends BaseMetricRecord {
  readonly dataType: 'distance';
  readonly unit: 'm';
}

export interface ActiveCaloriesRecord extends BaseMetricRecord {
  readonly dataType: 'activeCalories';
  readonly unit: 'kcal';
}

export interface SpeedRecord extends BaseMetricRecord {
  readonly dataType: 'speed';
  readonly unit: 'm/s';
}

export interface StepCountRecord extends BaseMetricRecord {
  readonly dataType: 'stepCount';
  readonly unit: 'count';
}

export interface PowerRecord extends BaseMetricRecord {
  readonly dataType: 'power';
  readonly unit: 'W';
}

export interface CadenceRecord extends BaseMetricRecord {
  readonly dataType: 'cadence';
  readonly unit: 'rpm' | 'spm';
}

/**
 * Union type for all workout metric records
 */
export type WorkoutMetricRecord = 
  | HeartRateRecord
  | DistanceRecord
  | ActiveCaloriesRecord
  | SpeedRecord
  | StepCountRecord
  | PowerRecord
  | CadenceRecord;

/**
 * Helper function to convert WorkoutSample to RawWorkout format
 */
export const convertWorkoutSampleToRaw = (workoutSample: any): any => {
  return {
    id: workoutSample.uuid,
    activityType: workoutSample.workoutActivityType,
    startDate: workoutSample.startDate,
    endDate: workoutSample.endDate,
    duration: workoutSample.duration,
    totalDistance: workoutSample.totalDistance,
    totalEnergyBurned: workoutSample.totalEnergyBurned,
    sourceName: workoutSample.sourceName,
    sourceRevision: workoutSample.sourceRevision,
    device: workoutSample.device,
    metadata: workoutSample.metadata,
    workoutEvents: workoutSample.workoutEvents
  };
};