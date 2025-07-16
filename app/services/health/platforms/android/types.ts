/**
 * Health Connect data type mappings
 */
export const HEALTH_CONNECT_DATA_TYPES = {
  // Vital signs
  HEART_RATE: 'HeartRate',
  BLOOD_PRESSURE: 'BloodPressure',
  RESPIRATORY_RATE: 'RespiratoryRate',
  BODY_TEMPERATURE: 'BodyTemperature',
  OXYGEN_SATURATION: 'OxygenSaturation',
  
  // Body measurements
  WEIGHT: 'Weight',
  HEIGHT: 'Height',
  BMI: 'BodyMassIndex', // May not be available
  BODY_FAT: 'BodyFat',
  
  // Activity
  STEPS: 'Steps',
  DISTANCE: 'Distance',
  ACTIVE_CALORIES: 'ActiveCaloriesBurned',
  TOTAL_CALORIES: 'TotalCaloriesBurned',
  EXERCISE_SESSION: 'ExerciseSession',
  SPEED: 'Speed',
  POWER: 'Power',
  
  // Sleep
  SLEEP_SESSION: 'SleepSession',
  
  // Nutrition
  NUTRITION: 'Nutrition',
  HYDRATION: 'Hydration'
} as const;

/**
 * Health Connect permission mappings
 */
export const HEALTH_CONNECT_PERMISSIONS = {
  // Vital signs
  HEART_RATE: { accessType: 'read' as const, recordType: 'HeartRate' as const },
  BLOOD_PRESSURE: { accessType: 'read' as const, recordType: 'BloodPressure' as const },
  RESPIRATORY_RATE: { accessType: 'read' as const, recordType: 'RespiratoryRate' as const },
  BODY_TEMPERATURE: { accessType: 'read' as const, recordType: 'BodyTemperature' as const },
  OXYGEN_SATURATION: { accessType: 'read' as const, recordType: 'OxygenSaturation' as const },
  
  // Body measurements
  WEIGHT: { accessType: 'read' as const, recordType: 'Weight' as const },
  HEIGHT: { accessType: 'read' as const, recordType: 'Height' as const },
  BODY_FAT: { accessType: 'read' as const, recordType: 'BodyFat' as const },
  
  // Activity
  STEPS: { accessType: 'read' as const, recordType: 'Steps' as const },
  DISTANCE: { accessType: 'read' as const, recordType: 'Distance' as const },
  ACTIVE_CALORIES: { accessType: 'read' as const, recordType: 'ActiveCaloriesBurned' as const },
  TOTAL_CALORIES: { accessType: 'read' as const, recordType: 'TotalCaloriesBurned' as const },
  EXERCISE_SESSION: { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
  SPEED: { accessType: 'read' as const, recordType: 'Speed' as const },
  POWER: { accessType: 'read' as const, recordType: 'Power' as const },
  
  // Sleep
  SLEEP_SESSION: { accessType: 'read' as const, recordType: 'SleepSession' as const },
  
  // Nutrition
  NUTRITION: { accessType: 'read' as const, recordType: 'Nutrition' as const },
  HYDRATION: { accessType: 'read' as const, recordType: 'Hydration' as const }
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
  HEALTH_CONNECT_PERMISSIONS.SLEEP_SESSION,
  HEALTH_CONNECT_PERMISSIONS.EXERCISE_SESSION,
  HEALTH_CONNECT_PERMISSIONS.SPEED,
  HEALTH_CONNECT_PERMISSIONS.POWER
] as const;