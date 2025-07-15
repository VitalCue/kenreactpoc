import type { QuantitySample as HKQuantitySample } from '@kingstinct/react-native-healthkit';
import type { HealthDataAdapter, IOSHealthData, PlatformSpecificData } from '../../core/types';
import type { HKDevice, HKSourceRevision } from './types';
import { HEALTHKIT_DATA_TYPES } from './types';

/**
 * Helper function to convert HealthKit sample to unified format
 */
export const convertSample = (sample: HKQuantitySample, dataType: string): HealthDataAdapter => {
  const platformData: PlatformSpecificData = {
    platform: 'ios',
    data: {
      device: sample.device,
      quantityType: sample.quantityType,
      metadata: sample.metadata,
      sourceRevision: sample.sourceRevision,
      sampleType: dataType,
    } as IOSHealthData
  };

  return {
    uuid: sample.uuid,
    deviceManf: sample.device?.manufacturer || 'Unknown',
    deviceModel: sample.device?.model || 'Unknown',
    dataType: sample.quantityType,
    startDate: sample.startDate.toISOString(),
    endDate: sample.endDate.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: sample.quantity,
    unit: sample.unit,
    dataOrigin: sample.sourceRevision?.source?.bundleIdentifier || 'Unknown',
    platformData,
  };
};

/**
 * Helper function to convert HK types to our unified format
 */
export const convertHKDeviceToIOSDevice = (device?: HKDevice): IOSHealthData['device'] => {
  if (!device) return undefined;
  return {
    name: device.name || undefined,
    manufacturer: device.manufacturer || undefined,
    model: device.model || undefined,
    hardwareVersion: device.hardwareVersion || undefined,
    firmwareVersion: device.firmwareVersion || undefined,
    softwareVersion: device.softwareVersion || undefined,
    localIdentifier: device.localIdentifier || undefined,
    udiDeviceIdentifier: device.udiDeviceIdentifier || undefined
  };
};

export const convertHKSourceRevisionToIOSSourceRevision = (sourceRevision?: HKSourceRevision): IOSHealthData['sourceRevision'] => {
  if (!sourceRevision || !sourceRevision.source) return undefined;
  return {
    source: {
      name: sourceRevision.source.name || '',
      bundleIdentifier: sourceRevision.source.bundleIdentifier || ''
    },
    version: sourceRevision.version,
    productType: sourceRevision.productType,
    operatingSystemVersion: sourceRevision.operatingSystemVersion ? {
      majorVersion: 0,
      minorVersion: 0, 
      patchVersion: 0
    } : undefined
  };
};

/**
 * Maps generic health data types to HealthKit identifiers
 */
export const mapToHKDataType = (dataType: string): string => {
  const mapping: Record<string, string> = {
    // Vital signs
    'heartRate': HEALTHKIT_DATA_TYPES.HEART_RATE,
    'bloodPressureSystolic': HEALTHKIT_DATA_TYPES.BLOOD_PRESSURE_SYSTOLIC,
    'bloodPressureDiastolic': HEALTHKIT_DATA_TYPES.BLOOD_PRESSURE_DIASTOLIC,
    'respiratoryRate': HEALTHKIT_DATA_TYPES.RESPIRATORY_RATE,
    'bodyTemperature': HEALTHKIT_DATA_TYPES.BODY_TEMPERATURE,
    'oxygenSaturation': HEALTHKIT_DATA_TYPES.OXYGEN_SATURATION,
    
    // Body measurements
    'bodyWeight': HEALTHKIT_DATA_TYPES.BODY_MASS,
    'bodyMass': HEALTHKIT_DATA_TYPES.BODY_MASS,
    'height': HEALTHKIT_DATA_TYPES.HEIGHT,
    'bmi': HEALTHKIT_DATA_TYPES.BMI,
    'bodyFatPercentage': HEALTHKIT_DATA_TYPES.BODY_FAT_PERCENTAGE,
    'leanBodyMass': HEALTHKIT_DATA_TYPES.LEAN_BODY_MASS,
    
    // Activity
    'stepCount': HEALTHKIT_DATA_TYPES.STEP_COUNT,
    'steps': HEALTHKIT_DATA_TYPES.STEP_COUNT,
    'distance': HEALTHKIT_DATA_TYPES.DISTANCE_WALKING_RUNNING,
    'distanceWalkingRunning': HEALTHKIT_DATA_TYPES.DISTANCE_WALKING_RUNNING,
    'flightsClimbed': HEALTHKIT_DATA_TYPES.FLIGHTS_CLIMBED,
    'activeCalories': HEALTHKIT_DATA_TYPES.ACTIVE_ENERGY_BURNED,
    'activeEnergyBurned': HEALTHKIT_DATA_TYPES.ACTIVE_ENERGY_BURNED,
    'basalCalories': HEALTHKIT_DATA_TYPES.BASAL_ENERGY_BURNED,
    'basalEnergyBurned': HEALTHKIT_DATA_TYPES.BASAL_ENERGY_BURNED,
    'calories': HEALTHKIT_DATA_TYPES.ACTIVE_ENERGY_BURNED, // Default to active calories
    'walkingSpeed': HEALTHKIT_DATA_TYPES.WALKING_SPEED,
    'runningSpeed': HEALTHKIT_DATA_TYPES.RUNNING_SPEED,
    
    // Sleep
    'sleepAnalysis': HEALTHKIT_DATA_TYPES.SLEEP_ANALYSIS,
    'sleep': HEALTHKIT_DATA_TYPES.SLEEP_ANALYSIS,
    
    // Nutrition
    'dietaryEnergy': HEALTHKIT_DATA_TYPES.DIETARY_ENERGY_CONSUMED,
    'dietaryProtein': HEALTHKIT_DATA_TYPES.DIETARY_PROTEIN,
    'dietaryCarbohydrates': HEALTHKIT_DATA_TYPES.DIETARY_CARBOHYDRATES,
    'dietaryFiber': HEALTHKIT_DATA_TYPES.DIETARY_FIBER
  };
  
  return mapping[dataType] || dataType;
};