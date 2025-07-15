/**
 * Health Connect data type mappings
 */
export const HEALTH_CONNECT_DATA_TYPES = {
  // Vital signs
  HEART_RATE: 'HeartRateRecord',
  BLOOD_PRESSURE: 'BloodPressureRecord',
  RESPIRATORY_RATE: 'RespiratoryRateRecord',
  BODY_TEMPERATURE: 'BodyTemperatureRecord',
  OXYGEN_SATURATION: 'OxygenSaturationRecord',
  
  // Body measurements
  WEIGHT: 'WeightRecord',
  HEIGHT: 'HeightRecord',
  BMI: 'BodyMassIndexRecord', // May not be available
  BODY_FAT: 'BodyFatRecord',
  
  // Activity
  STEPS: 'StepsRecord',
  DISTANCE: 'DistanceRecord',
  ACTIVE_CALORIES: 'ActiveCaloriesBurnedRecord',
  TOTAL_CALORIES: 'TotalCaloriesBurnedRecord',
  
  // Sleep
  SLEEP_SESSION: 'SleepSessionRecord',
  
  // Nutrition
  NUTRITION: 'NutritionRecord',
  HYDRATION: 'HydrationRecord'
} as const;

/**
 * Health Connect permission mappings
 */
export const HEALTH_CONNECT_PERMISSIONS = {
  // Vital signs
  HEART_RATE: { accessType: 'read', recordType: 'HeartRateRecord' },
  BLOOD_PRESSURE: { accessType: 'read', recordType: 'BloodPressureRecord' },
  RESPIRATORY_RATE: { accessType: 'read', recordType: 'RespiratoryRateRecord' },
  BODY_TEMPERATURE: { accessType: 'read', recordType: 'BodyTemperatureRecord' },
  OXYGEN_SATURATION: { accessType: 'read', recordType: 'OxygenSaturationRecord' },
  
  // Body measurements
  WEIGHT: { accessType: 'read', recordType: 'WeightRecord' },
  HEIGHT: { accessType: 'read', recordType: 'HeightRecord' },
  BODY_FAT: { accessType: 'read', recordType: 'BodyFatRecord' },
  
  // Activity
  STEPS: { accessType: 'read', recordType: 'StepsRecord' },
  DISTANCE: { accessType: 'read', recordType: 'DistanceRecord' },
  ACTIVE_CALORIES: { accessType: 'read', recordType: 'ActiveCaloriesBurnedRecord' },
  TOTAL_CALORIES: { accessType: 'read', recordType: 'TotalCaloriesBurnedRecord' },
  
  // Sleep
  SLEEP_SESSION: { accessType: 'read', recordType: 'SleepSessionRecord' },
  
  // Nutrition
  NUTRITION: { accessType: 'read', recordType: 'NutritionRecord' },
  HYDRATION: { accessType: 'read', recordType: 'HydrationRecord' }
} as const;

/**
 * Default Health Connect permissions for basic health data
 */
export const HEALTH_CONNECT_BASIC_PERMISSIONS = [
  HEALTH_CONNECT_PERMISSIONS.HEART_RATE,
  HEALTH_CONNECT_PERMISSIONS.BLOOD_PRESSURE,
  HEALTH_CONNECT_PERMISSIONS.WEIGHT,
  HEALTH_CONNECT_PERMISSIONS.HEIGHT,
  HEALTH_CONNECT_PERMISSIONS.STEPS,
  HEALTH_CONNECT_PERMISSIONS.DISTANCE,
  HEALTH_CONNECT_PERMISSIONS.ACTIVE_CALORIES,
  HEALTH_CONNECT_PERMISSIONS.SLEEP_SESSION
] as const;