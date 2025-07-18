import type { AnyMap } from 'react-native-nitro-modules';

/**
 * HealthKit WorkoutEvent type
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
  
  // Activity & Exercise
  STEPS: 'HKQuantityTypeIdentifierStepCount',
  DISTANCE_WALKING_RUNNING: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  ACTIVE_ENERGY_BURNED: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  BASAL_ENERGY_BURNED: 'HKQuantityTypeIdentifierBasalEnergyBurned',
  
  // Body Measurements
  HEIGHT: 'HKQuantityTypeIdentifierHeight',
  BODY_MASS: 'HKQuantityTypeIdentifierBodyMass',
  BODY_MASS_INDEX: 'HKQuantityTypeIdentifierBodyMassIndex',
  BODY_FAT_PERCENTAGE: 'HKQuantityTypeIdentifierBodyFatPercentage',
  LEAN_BODY_MASS: 'HKQuantityTypeIdentifierLeanBodyMass',
  
  // Nutrition
  DIETARY_ENERGY_CONSUMED: 'HKQuantityTypeIdentifierDietaryEnergyConsumed',
  DIETARY_WATER: 'HKQuantityTypeIdentifierDietaryWater',
  
  // Sleep
  SLEEP_ANALYSIS: 'HKCategoryTypeIdentifierSleepAnalysis',
  
  // Workout
  WORKOUT_TYPE: 'HKWorkoutTypeIdentifier',
} as const;

/**
 * Basic HealthKit permissions for common health data
 */
export const HEALTHKIT_BASIC_PERMISSIONS = [
  HEALTHKIT_DATA_TYPES.HEART_RATE,
  HEALTHKIT_DATA_TYPES.STEPS,
  HEALTHKIT_DATA_TYPES.DISTANCE_WALKING_RUNNING,
  HEALTHKIT_DATA_TYPES.ACTIVE_ENERGY_BURNED,
  HEALTHKIT_DATA_TYPES.BODY_MASS,
  HEALTHKIT_DATA_TYPES.HEIGHT,
  HEALTHKIT_DATA_TYPES.SLEEP_ANALYSIS,
  HEALTHKIT_DATA_TYPES.WORKOUT_TYPE,
] as const;

/**
 * Helper function to convert HealthKit types to our unified format
 */
export const convertHKDeviceToIOSDevice = (device?: HKDevice) => {
  if (!device) return undefined;
  
  return {
    name: device.name || undefined,
    manufacturer: device.manufacturer || undefined,
    model: device.model || undefined,
    hardwareVersion: device.hardwareVersion || undefined,
    firmwareVersion: device.firmwareVersion || undefined,
    softwareVersion: device.softwareVersion || undefined,
    localIdentifier: device.localIdentifier || undefined,
    udiDeviceIdentifier: device.udiDeviceIdentifier || undefined,
  };
};

/**
 * Helper function to convert HealthKit SourceRevision to our unified format
 */
export const convertHKSourceRevisionToIOSSourceRevision = (sourceRevision?: HKSourceRevision) => {
  if (!sourceRevision?.source) return undefined;
  
  return {
    source: {
      name: sourceRevision.source.name || '',
      bundleIdentifier: sourceRevision.source.bundleIdentifier || '',
    },
    version: sourceRevision.version,
    productType: sourceRevision.productType,
    systemVersion: sourceRevision.operatingSystemVersion?.string,
    operatingSystemVersion: sourceRevision.operatingSystemVersion ? {
      majorVersion: sourceRevision.operatingSystemVersion.majorVersion || 0,
      minorVersion: sourceRevision.operatingSystemVersion.minorVersion || 0,
      patchVersion: sourceRevision.operatingSystemVersion.patchVersion || 0,
    } : undefined,
  };
};

/**
 * Maps our unified WorkoutMetricDataType to HealthKit quantity type identifiers
 */
export const mapMetricTypeToHealthKit = (metricType: string): string | null => {
  const mapping: Record<string, string> = {
    'heartRate': 'HKQuantityTypeIdentifierHeartRate',
    'distance': 'HKQuantityTypeIdentifierDistanceWalkingRunning',
    'activeCalories': 'HKQuantityTypeIdentifierActiveEnergyBurned',
    'speed': 'HKQuantityTypeIdentifierRunningSpeed',
    'stepCount': 'HKQuantityTypeIdentifierStepCount',
    'power': 'HKQuantityTypeIdentifierCyclingPower',
    'cadence': 'HKQuantityTypeIdentifierRunningCadence',
    'elevation': 'HKQuantityTypeIdentifierElevation', 
    'temperature': 'HKQuantityTypeIdentifierBodyTemperature'
  };
  
  return mapping[metricType] || null;
};