import type { AnyMap } from 'react-native-nitro-modules';

/**
 * HealthKit compatibility types from react-native-healthkit library
 */
export interface HKWorkoutEvent {
  readonly uuid: string;
  readonly type: number;
  readonly date: Date;
  readonly duration?: number;
  readonly metadata?: AnyMap;
}

/**
 * HealthKit Device type (compatible with library)
 */
export interface HKDevice {
  readonly name?: string | null;
  readonly manufacturer?: string | null;
  readonly model?: string | null;
  readonly hardwareVersion?: string | null;
  readonly firmwareVersion?: string | null;
  readonly softwareVersion?: string | null;
  readonly localIdentifier?: string | null;
  readonly udiDeviceIdentifier?: string | null;
}

/**
 * HealthKit SourceRevision type (compatible with library)
 */
export interface HKSourceRevision {
  readonly source?: {
    readonly name?: string;
    readonly bundleIdentifier?: string;
  };
  readonly version?: string;
  readonly productType?: string;
  readonly operatingSystemVersion?: any;
}

/**
 * Common HealthKit data type identifiers for basic health data
 */
export const HEALTHKIT_DATA_TYPES = {
  // Vital signs
  HEART_RATE: 'HKQuantityTypeIdentifierHeartRate',
  BLOOD_PRESSURE_SYSTOLIC: 'HKQuantityTypeIdentifierBloodPressureSystolic',
  BLOOD_PRESSURE_DIASTOLIC: 'HKQuantityTypeIdentifierBloodPressureDiastolic',
  RESPIRATORY_RATE: 'HKQuantityTypeIdentifierRespiratoryRate',
  BODY_TEMPERATURE: 'HKQuantityTypeIdentifierBodyTemperature',
  OXYGEN_SATURATION: 'HKQuantityTypeIdentifierOxygenSaturation',
  
  // Body measurements
  BODY_MASS: 'HKQuantityTypeIdentifierBodyMass',
  HEIGHT: 'HKQuantityTypeIdentifierHeight',
  BMI: 'HKQuantityTypeIdentifierBodyMassIndex',
  BODY_FAT_PERCENTAGE: 'HKQuantityTypeIdentifierBodyFatPercentage',
  LEAN_BODY_MASS: 'HKQuantityTypeIdentifierLeanBodyMass',
  
  // Activity
  STEP_COUNT: 'HKQuantityTypeIdentifierStepCount',
  DISTANCE_WALKING_RUNNING: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  FLIGHTS_CLIMBED: 'HKQuantityTypeIdentifierFlightsClimbed',
  ACTIVE_ENERGY_BURNED: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  BASAL_ENERGY_BURNED: 'HKQuantityTypeIdentifierBasalEnergyBurned',
  WALKING_SPEED: 'HKQuantityTypeIdentifierWalkingSpeed',
  RUNNING_SPEED: 'HKQuantityTypeIdentifierRunningSpeed',
  
  // Sleep
  SLEEP_ANALYSIS: 'HKCategoryTypeIdentifierSleepAnalysis',
  
  // Nutrition
  DIETARY_ENERGY_CONSUMED: 'HKQuantityTypeIdentifierDietaryEnergyConsumed',
  DIETARY_PROTEIN: 'HKQuantityTypeIdentifierDietaryProtein',
  DIETARY_CARBOHYDRATES: 'HKQuantityTypeIdentifierDietaryCarbohydrates',
  DIETARY_FIBER: 'HKQuantityTypeIdentifierDietaryFiber'
} as const;

/**
 * Required HealthKit permissions for basic health data
 */
export const HEALTHKIT_BASIC_PERMISSIONS = [
  // Vital signs
  HEALTHKIT_DATA_TYPES.HEART_RATE,
  HEALTHKIT_DATA_TYPES.BLOOD_PRESSURE_SYSTOLIC,
  HEALTHKIT_DATA_TYPES.BLOOD_PRESSURE_DIASTOLIC,
  HEALTHKIT_DATA_TYPES.RESPIRATORY_RATE,
  HEALTHKIT_DATA_TYPES.BODY_TEMPERATURE,
  HEALTHKIT_DATA_TYPES.OXYGEN_SATURATION,
  
  // Body measurements
  HEALTHKIT_DATA_TYPES.BODY_MASS,
  HEALTHKIT_DATA_TYPES.HEIGHT,
  HEALTHKIT_DATA_TYPES.BMI,
  HEALTHKIT_DATA_TYPES.BODY_FAT_PERCENTAGE,
  
  // Activity
  HEALTHKIT_DATA_TYPES.STEP_COUNT,
  HEALTHKIT_DATA_TYPES.DISTANCE_WALKING_RUNNING,
  HEALTHKIT_DATA_TYPES.FLIGHTS_CLIMBED,
  HEALTHKIT_DATA_TYPES.ACTIVE_ENERGY_BURNED,
  HEALTHKIT_DATA_TYPES.BASAL_ENERGY_BURNED,
  HEALTHKIT_DATA_TYPES.WALKING_SPEED,
  HEALTHKIT_DATA_TYPES.RUNNING_SPEED,
  
  // Sleep
  HEALTHKIT_DATA_TYPES.SLEEP_ANALYSIS
] as const;

/**
 * Workout-specific permissions
 */
export const HEALTHKIT_WORKOUT_PERMISSIONS = [
  'HKWorkoutTypeIdentifier',
  'HKQuantityTypeIdentifierDistanceCycling',
  'HKQuantityTypeIdentifierDistanceSwimming',
  'HKQuantityTypeIdentifierCyclingSpeed',
  'HKQuantityTypeIdentifierRunningSpeed',
  'HKQuantityTypeIdentifierCyclingPower',
  'HKQuantityTypeIdentifierCyclingCadence',
  'HKQuantityTypeIdentifierRunningStrideLength',
  'HKQuantityTypeIdentifierRunningVerticalOscillation',
  'HKQuantityTypeIdentifierRunningGroundContactTime',
  'HKQuantityTypeIdentifierRunningPower',
] as const;