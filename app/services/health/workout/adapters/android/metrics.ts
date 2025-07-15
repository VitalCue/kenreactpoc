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
import type { RawHealthConnectMetric } from './types';
import { HEALTH_CONNECT_DATA_TYPES } from './types';

/**
 * Converts raw Health Connect metric to unified MetricRecordAdapter
 */
export function adaptHealthConnectMetric(raw: RawHealthConnectMetric): MetricRecordAdapter {
  const baseAdapter = {
    uuid: raw.uuid,
    deviceManf: 'Android',
    deviceModel: 'Unknown',
    startDate: raw.startDate,
    endDate: raw.endDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: raw.amount,
    unit: raw.unit,
    dataOrigin: raw.dataOrigin,
    platformData: {
      platform: 'android' as const,
      data: {
        metadata: raw.metadata,
        dataType: raw.dataType
      }
    }
  };
  
  // Map to specific metric type based on Health Connect data type
  switch (raw.dataType) {
    case HEALTH_CONNECT_DATA_TYPES.HEART_RATE:
      return {
        ...baseAdapter,
        dataType: 'heartRate',
        unit: 'bpm'
      } as HeartRateRecordAdapter;
      
    case HEALTH_CONNECT_DATA_TYPES.DISTANCE:
      return {
        ...baseAdapter,
        dataType: 'distance',
        unit: 'm'
      } as DistanceRecordAdapter;
      
    case HEALTH_CONNECT_DATA_TYPES.ACTIVE_CALORIES:
      return {
        ...baseAdapter,
        dataType: 'activeCalories',
        unit: 'kcal'
      } as ActiveCaloriesRecordAdapter;
      
    case HEALTH_CONNECT_DATA_TYPES.SPEED:
      return {
        ...baseAdapter,
        dataType: 'speed',
        unit: 'm/s'
      } as SpeedRecordAdapter;
      
    case HEALTH_CONNECT_DATA_TYPES.STEPS:
      return {
        ...baseAdapter,
        dataType: 'stepCount',
        unit: 'count'
      } as StepCountRecordAdapter;
      
    case HEALTH_CONNECT_DATA_TYPES.POWER:
      return {
        ...baseAdapter,
        dataType: 'power',
        unit: 'W'
      } as PowerRecordAdapter;
      
    case HEALTH_CONNECT_DATA_TYPES.CYCLING_PEDALING_CADENCE:
      return {
        ...baseAdapter,
        dataType: 'cadence',
        unit: 'rpm'
      } as CadenceRecordAdapter;
      
    default:
      return {
        ...baseAdapter,
        dataType: mapHealthConnectDataType(raw.dataType) as any
      } as MetricRecordAdapter;
  }
}

/**
 * Maps Health Connect data type to unified metric type
 */
export function mapHealthConnectDataType(dataType: string): string {
  const typeMap: Record<string, string> = {
    'HeartRateRecord': 'heartRate',
    'DistanceRecord': 'distance',
    'ActiveCaloriesBurnedRecord': 'activeCalories',
    'TotalCaloriesBurnedRecord': 'activeCalories',
    'SpeedRecord': 'speed',
    'StepsRecord': 'stepCount',
    'PowerRecord': 'power',
    'CyclingPedalingCadenceRecord': 'cadence'
  };
  
  return typeMap[dataType] || dataType.toLowerCase().replace('record', '');
}

/**
 * Filters Health Connect metrics by workout time range
 */
export function filterHealthConnectMetricsByWorkoutTime(
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