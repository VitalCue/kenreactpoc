import type { HealthDataAdapter, AndroidHealthData, PlatformSpecificData } from '../../types';
import { HEALTH_CONNECT_DATA_TYPES, HEALTH_CONNECT_PERMISSIONS } from './types';

/**
 * Helper function to convert Health Connect record to our unified format
 */
export const convertRecord = (record: any, dataType: string): HealthDataAdapter => {
  const platformData: PlatformSpecificData = {
    platform: 'android',
    data: {
      metadata: record.metadata,
      dataPointType: record.recordType,
      originalDataFormat: record.dataOrigin?.packageName,
      dataCollector: {
        appPackageName: record.dataOrigin?.packageName,
        dataStreamId: record.dataOrigin?.dataStreamId,
        dataStreamName: record.dataOrigin?.dataStreamName,
      },
    } as AndroidHealthData
  };

  return {
    uuid: record.recordId || `${record.startTime}-${record.endTime}-${dataType}`,
    deviceManf: record.device?.manufacturer || 'Unknown',
    deviceModel: record.device?.model || 'Unknown',
    dataType,
    startDate: new Date(record.startTime).toISOString(),
    endDate: new Date(record.endTime).toISOString(),
    timezone: record.zoneOffset || Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: getRecordValue(record, dataType),
    unit: getRecordUnit(record, dataType),
    dataOrigin: record.dataOrigin?.packageName || 'Unknown',
    platformData,
  };
};

/**
 * Helper function to extract value from different record types
 */
export const getRecordValue = (record: any, dataType: string): number => {
  switch (dataType) {
    case 'steps':
    case 'stepCount':
      return record.count || 0;
    case 'distance':
      return record.distance?.inMeters || 0;
    case 'activeCalories':
    case 'calories':
      return record.energy?.inCalories || 0;
    case 'walkingSpeed':
    case 'runningSpeed':
    case 'speed':
      return record.speed?.inMetersPerSecond || 0;
    case 'heartRate':
      return record.beatsPerMinute || 0;
    case 'weight':
    case 'bodyWeight':
      return record.weight?.inKilograms || 0;
    case 'height':
    case 'bodyHeight':
      return record.height?.inMeters || 0;
    case 'bloodPressureSystolic':
      return record.systolic?.inMillimetersOfMercury || 0;
    case 'bloodPressureDiastolic':
      return record.diastolic?.inMillimetersOfMercury || 0;
    case 'bodyTemperature':
      return record.temperature?.inCelsius || 0;
    case 'oxygenSaturation':
      return record.percentage?.value || 0;
    case 'power':
      return record.power?.inWatts || 0;
    case 'exerciseSession':
    case 'workoutSession':
      // For exercise sessions, return duration in seconds
      const start = new Date(record.startTime);
      const end = new Date(record.endTime);
      return (end.getTime() - start.getTime()) / 1000;
    default:
      return record.value || record.count || record.amount || 0;
  }
};

/**
 * Helper function to get unit for different record types
 */
export const getRecordUnit = (record: any, dataType: string): string => {
  switch (dataType) {
    case 'steps':
    case 'stepCount':
      return 'count';
    case 'distance':
      return 'm';
    case 'activeCalories':
    case 'calories':
      return 'kcal';
    case 'walkingSpeed':
    case 'runningSpeed':
    case 'speed':
      return 'm/s';
    case 'heartRate':
      return 'bpm';
    case 'weight':
    case 'bodyWeight':
      return 'kg';
    case 'height':
    case 'bodyHeight':
      return 'm';
    case 'bloodPressureSystolic':
    case 'bloodPressureDiastolic':
      return 'mmHg';
    case 'bodyTemperature':
      return '°C';
    case 'oxygenSaturation':
      return '%';
    case 'power':
      return 'W';
    case 'exerciseSession':
    case 'workoutSession':
      return 'seconds';
    default:
      return record.unit || 'unknown';
  }
};

/**
 * Maps generic health data types to Health Connect record types
 */
export const mapToHealthConnectRecordType = (dataType: string): string => {
  const mapping: Record<string, string> = {
    // Vital signs
    'heartRate': HEALTH_CONNECT_DATA_TYPES.HEART_RATE,
    'bloodPressure': HEALTH_CONNECT_DATA_TYPES.BLOOD_PRESSURE,
    'bloodPressureSystolic': HEALTH_CONNECT_DATA_TYPES.BLOOD_PRESSURE,
    'bloodPressureDiastolic': HEALTH_CONNECT_DATA_TYPES.BLOOD_PRESSURE,
    'respiratoryRate': HEALTH_CONNECT_DATA_TYPES.RESPIRATORY_RATE,
    'bodyTemperature': HEALTH_CONNECT_DATA_TYPES.BODY_TEMPERATURE,
    'oxygenSaturation': HEALTH_CONNECT_DATA_TYPES.OXYGEN_SATURATION,
    
    // Body measurements
    'weight': HEALTH_CONNECT_DATA_TYPES.WEIGHT,
    'bodyWeight': HEALTH_CONNECT_DATA_TYPES.WEIGHT,
    'height': HEALTH_CONNECT_DATA_TYPES.HEIGHT,
    'bodyHeight': HEALTH_CONNECT_DATA_TYPES.HEIGHT,
    'bmi': HEALTH_CONNECT_DATA_TYPES.BMI,
    'bodyFat': HEALTH_CONNECT_DATA_TYPES.BODY_FAT,
    'bodyFatPercentage': HEALTH_CONNECT_DATA_TYPES.BODY_FAT,
    
    // Activity
    'steps': HEALTH_CONNECT_DATA_TYPES.STEPS,
    'stepCount': HEALTH_CONNECT_DATA_TYPES.STEPS,
    'distance': HEALTH_CONNECT_DATA_TYPES.DISTANCE,
    'activeCalories': HEALTH_CONNECT_DATA_TYPES.ACTIVE_CALORIES,
    'totalCalories': HEALTH_CONNECT_DATA_TYPES.TOTAL_CALORIES,
    'calories': HEALTH_CONNECT_DATA_TYPES.ACTIVE_CALORIES,
    'workoutSession': HEALTH_CONNECT_DATA_TYPES.EXERCISE_SESSION,
    'exerciseSession': HEALTH_CONNECT_DATA_TYPES.EXERCISE_SESSION,
    'speed': HEALTH_CONNECT_DATA_TYPES.SPEED,
    'walkingSpeed': HEALTH_CONNECT_DATA_TYPES.SPEED,
    'runningSpeed': HEALTH_CONNECT_DATA_TYPES.SPEED,
    'power': HEALTH_CONNECT_DATA_TYPES.POWER,
    
    // Sleep
    'sleep': HEALTH_CONNECT_DATA_TYPES.SLEEP_SESSION,
    'sleepAnalysis': HEALTH_CONNECT_DATA_TYPES.SLEEP_SESSION,
    
    // Nutrition
    'nutrition': HEALTH_CONNECT_DATA_TYPES.NUTRITION,
    'hydration': HEALTH_CONNECT_DATA_TYPES.HYDRATION
  };
  
  return mapping[dataType] || dataType;
};

/**
 * Maps generic health data types to Health Connect permissions
 */
export const mapToHealthConnectPermission = (dataType: string) => {
  const mapping: Record<string, { accessType: 'read'; recordType: any }> = {
    // Vital signs
    'heartRate': HEALTH_CONNECT_PERMISSIONS.HEART_RATE,
    'bloodPressure': HEALTH_CONNECT_PERMISSIONS.BLOOD_PRESSURE,
    'bloodPressureSystolic': HEALTH_CONNECT_PERMISSIONS.BLOOD_PRESSURE,
    'bloodPressureDiastolic': HEALTH_CONNECT_PERMISSIONS.BLOOD_PRESSURE,
    'respiratoryRate': HEALTH_CONNECT_PERMISSIONS.RESPIRATORY_RATE,
    'bodyTemperature': HEALTH_CONNECT_PERMISSIONS.BODY_TEMPERATURE,
    'oxygenSaturation': HEALTH_CONNECT_PERMISSIONS.OXYGEN_SATURATION,
    
    // Body measurements
    'weight': HEALTH_CONNECT_PERMISSIONS.WEIGHT,
    'bodyWeight': HEALTH_CONNECT_PERMISSIONS.WEIGHT,
    'height': HEALTH_CONNECT_PERMISSIONS.HEIGHT,
    'bodyHeight': HEALTH_CONNECT_PERMISSIONS.HEIGHT,
    'bodyFat': HEALTH_CONNECT_PERMISSIONS.BODY_FAT,
    'bodyFatPercentage': HEALTH_CONNECT_PERMISSIONS.BODY_FAT,
    
    // Activity
    'steps': HEALTH_CONNECT_PERMISSIONS.STEPS,
    'stepCount': HEALTH_CONNECT_PERMISSIONS.STEPS,
    'distance': HEALTH_CONNECT_PERMISSIONS.DISTANCE,
    'activeCalories': HEALTH_CONNECT_PERMISSIONS.ACTIVE_CALORIES,
    'totalCalories': HEALTH_CONNECT_PERMISSIONS.TOTAL_CALORIES,
    'calories': HEALTH_CONNECT_PERMISSIONS.ACTIVE_CALORIES,
    'workoutSession': HEALTH_CONNECT_PERMISSIONS.EXERCISE_SESSION,
    'exerciseSession': HEALTH_CONNECT_PERMISSIONS.EXERCISE_SESSION,
    'speed': HEALTH_CONNECT_PERMISSIONS.SPEED,
    'walkingSpeed': HEALTH_CONNECT_PERMISSIONS.SPEED,
    'runningSpeed': HEALTH_CONNECT_PERMISSIONS.SPEED,
    'power': HEALTH_CONNECT_PERMISSIONS.POWER,
    
    // Sleep
    'sleep': HEALTH_CONNECT_PERMISSIONS.SLEEP_SESSION,
    'sleepAnalysis': HEALTH_CONNECT_PERMISSIONS.SLEEP_SESSION,
    
    // Nutrition
    'nutrition': HEALTH_CONNECT_PERMISSIONS.NUTRITION,
    'hydration': HEALTH_CONNECT_PERMISSIONS.HYDRATION
  };
  
  return mapping[dataType] || { accessType: 'read', recordType: dataType };
};