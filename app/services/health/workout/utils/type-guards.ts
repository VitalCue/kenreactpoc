import type { HealthDataAdapter } from '../../types';
import type {
  WorkoutSessionAdapter,
  MetricRecordAdapter,
  HeartRateRecordAdapter,
  DistanceRecordAdapter,
  WorkoutPlatformData
} from '../types';

/**
 * Type guard to check if data is a workout session
 */
export const isWorkoutSession = (
  data: HealthDataAdapter
): data is WorkoutSessionAdapter => {
  return data.dataType === 'workoutSession';
};

/**
 * Type guard to check if data is a metric record
 */
export const isMetricRecord = (
  data: HealthDataAdapter
): data is MetricRecordAdapter => {
  return ['heartRate', 'distance', 'activeCalories', 'speed', 'stepCount', 'power', 'cadence'].includes(data.dataType);
};

/**
 * Type guard to check if data is a heart rate record
 */
export const isHeartRateRecord = (
  data: HealthDataAdapter
): data is HeartRateRecordAdapter => {
  return data.dataType === 'heartRate';
};

/**
 * Type guard to check if data is a distance record
 */
export const isDistanceRecord = (
  data: HealthDataAdapter
): data is DistanceRecordAdapter => {
  return data.dataType === 'distance';
};

/**
 * Type guard to check if platform data is iOS
 */
export const isIOSWorkoutData = (
  data: WorkoutPlatformData
): data is { platform: 'ios'; data: any } => {
  return data.platform === 'ios';
};

/**
 * Type guard to check if platform data is Android
 */
export const isAndroidWorkoutData = (
  data: WorkoutPlatformData
): data is { platform: 'android'; data: any } => {
  return data.platform === 'android';
};

/**
 * Type guard to validate heart rate value
 */
export const isValidHeartRate = (hr: number): boolean => {
  return hr >= 40 && hr <= 220 && Number.isFinite(hr);
};

/**
 * Type guard to validate distance value
 */
export const isValidDistance = (distance: number): boolean => {
  return distance >= 0 && Number.isFinite(distance);
};

/**
 * Type guard to validate speed value
 */
export const isValidSpeed = (speed: number): boolean => {
  return speed >= 0 && speed <= 50 && Number.isFinite(speed); // Max ~180 km/h
};

/**
 * Type guard to validate power value
 */
export const isValidPower = (power: number): boolean => {
  return power >= 0 && power <= 3000 && Number.isFinite(power); // Max reasonable power output
};

/**
 * Type guard to validate cadence value
 */
export const isValidCadence = (cadence: number): boolean => {
  return cadence >= 0 && cadence <= 300 && Number.isFinite(cadence); // Max reasonable cadence
};