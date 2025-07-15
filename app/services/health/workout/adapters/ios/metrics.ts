import type {
  MetricRecordAdapter,
  HeartRateRecordAdapter,
  DistanceRecordAdapter,
  ActiveCaloriesRecordAdapter,
  SpeedRecordAdapter,
  StepCountRecordAdapter,
  PowerRecordAdapter,
  CadenceRecordAdapter
} from '../../types';
import type { RawQuantitySample } from './types';
import { HEALTHKIT_QUANTITY_TYPES } from './types';

/**
 * Converts raw HealthKit HKQuantitySample to unified MetricRecordAdapter
 */
export function adaptHealthKitQuantitySample(raw: RawQuantitySample): MetricRecordAdapter {
  const baseAdapter = {
    uuid: raw.id,
    deviceManf: raw.device?.manufacturer || 'Apple',
    deviceModel: raw.device?.model || 'iPhone',
    startDate: raw.startDate,
    endDate: raw.endDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: raw.quantity,
    unit: raw.unit,
    dataOrigin: raw.sourceRevision?.source.bundleIdentifier || 'com.apple.health',
    platformData: {
      platform: 'ios' as const,
      data: {
        device: raw.device,
        sourceRevision: raw.sourceRevision,
        metadata: raw.metadata,
        quantityType: raw.quantityType,
        sampleType: raw.quantityType
      }
    }
  };
  
  // Map to specific metric type based on quantityType
  switch (raw.quantityType) {
    case HEALTHKIT_QUANTITY_TYPES.HEART_RATE:
      return {
        ...baseAdapter,
        dataType: 'heartRate',
        unit: 'bpm'
      } as HeartRateRecordAdapter;
      
    case HEALTHKIT_QUANTITY_TYPES.DISTANCE_WALKING_RUNNING:
    case HEALTHKIT_QUANTITY_TYPES.DISTANCE_CYCLING:
    case HEALTHKIT_QUANTITY_TYPES.DISTANCE_SWIMMING:
      return {
        ...baseAdapter,
        dataType: 'distance',
        unit: 'm'
      } as DistanceRecordAdapter;
      
    case HEALTHKIT_QUANTITY_TYPES.ACTIVE_ENERGY_BURNED:
      return {
        ...baseAdapter,
        dataType: 'activeCalories',
        unit: 'kcal'
      } as ActiveCaloriesRecordAdapter;
      
    case HEALTHKIT_QUANTITY_TYPES.CYCLING_SPEED:
    case HEALTHKIT_QUANTITY_TYPES.RUNNING_SPEED:
      return {
        ...baseAdapter,
        dataType: 'speed',
        unit: 'm/s'
      } as SpeedRecordAdapter;
      
    case HEALTHKIT_QUANTITY_TYPES.STEP_COUNT:
      return {
        ...baseAdapter,
        dataType: 'stepCount',
        unit: 'count'
      } as StepCountRecordAdapter;
      
    case HEALTHKIT_QUANTITY_TYPES.CYCLING_POWER:
      return {
        ...baseAdapter,
        dataType: 'power',
        unit: 'W'
      } as PowerRecordAdapter;
      
    case HEALTHKIT_QUANTITY_TYPES.CYCLING_CADENCE:
      return {
        ...baseAdapter,
        dataType: 'cadence',
        unit: 'rpm'
      } as CadenceRecordAdapter;
      
    case HEALTHKIT_QUANTITY_TYPES.RUNNING_CADENCE:
      return {
        ...baseAdapter,
        dataType: 'cadence',
        unit: 'spm'
      } as CadenceRecordAdapter;
      
    default:
      return {
        ...baseAdapter,
        dataType: mapHealthKitQuantityType(raw.quantityType) as any
      } as MetricRecordAdapter;
  }
}

/**
 * Maps HealthKit quantity type to unified metric type
 */
export function mapHealthKitQuantityType(quantityType: string): string {
  const typeMap: Record<string, string> = {
    'HKQuantityTypeIdentifierHeartRate': 'heartRate',
    'HKQuantityTypeIdentifierDistanceWalkingRunning': 'distance',
    'HKQuantityTypeIdentifierDistanceCycling': 'distance',
    'HKQuantityTypeIdentifierDistanceSwimming': 'distance',
    'HKQuantityTypeIdentifierActiveEnergyBurned': 'activeCalories',
    'HKQuantityTypeIdentifierStepCount': 'stepCount',
    'HKQuantityTypeIdentifierCyclingSpeed': 'speed',
    'HKQuantityTypeIdentifierRunningSpeed': 'speed',
    'HKQuantityTypeIdentifierCyclingPower': 'power',
    'HKQuantityTypeIdentifierCyclingCadence': 'cadence',
    'HKQuantityTypeIdentifierRunningCadence': 'cadence'
  };
  
  return typeMap[quantityType] || quantityType.toLowerCase();
}

/**
 * Filters metrics by workout time range
 */
export function filterMetricsByWorkoutTime(
  metrics: MetricRecordAdapter[],
  workoutStart: string,
  workoutEnd: string
): MetricRecordAdapter[] {
  const startTime = new Date(workoutStart).getTime();
  const endTime = new Date(workoutEnd).getTime();
  
  return metrics.filter(metric => {
    const metricTime = new Date(metric.startDate).getTime();
    return metricTime >= startTime && metricTime <= endTime;
  });
}

/**
 * Converts units for distance metrics to meters
 */
export function normalizeDistanceUnit(amount: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'km':
    case 'kilometer':
      return amount * 1000;
    case 'mi':
    case 'mile':
      return amount * 1609.34;
    case 'ft':
    case 'feet':
      return amount * 0.3048;
    case 'yd':
    case 'yard':
      return amount * 0.9144;
    case 'm':
    case 'meter':
    default:
      return amount;
  }
}

/**
 * Converts speed units to m/s
 */
export function normalizeSpeedUnit(amount: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'km/h':
    case 'kmh':
      return amount / 3.6;
    case 'mph':
    case 'mi/h':
      return amount * 0.44704;
    case 'ft/s':
      return amount * 0.3048;
    case 'm/s':
    default:
      return amount;
  }
}

/**
 * Converts energy units to kcal
 */
export function normalizeEnergyUnit(amount: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'cal':
    case 'calorie':
      return amount / 1000;
    case 'j':
    case 'joule':
      return amount / 4184;
    case 'kj':
    case 'kilojoule':
      return amount / 4.184;
    case 'kcal':
    case 'kilocalorie':
    default:
      return amount;
  }
}