/**
 * Common health data types
 */
export const HEALTH_DATA_TYPES = {
  // Basic health metrics
  HEART_RATE: 'heartRate',
  BLOOD_PRESSURE: 'bloodPressure',
  BODY_TEMPERATURE: 'bodyTemperature',
  BODY_WEIGHT: 'bodyWeight',
  BODY_HEIGHT: 'bodyHeight',
  BMI: 'bmi',
  
  // Activity metrics
  STEP_COUNT: 'stepCount',
  DISTANCE: 'distance',
  ACTIVE_CALORIES: 'activeCalories',
  RESTING_CALORIES: 'restingCalories',
  
  // Sleep metrics
  SLEEP_ANALYSIS: 'sleepAnalysis',
  
  // Respiratory metrics
  RESPIRATORY_RATE: 'respiratoryRate',
  OXYGEN_SATURATION: 'oxygenSaturation'
} as const;

/**
 * Health data units
 */
export const HEALTH_UNITS = {
  // Vital signs
  BPM: 'bpm',
  MMHG: 'mmHg',
  CELSIUS: '°C',
  FAHRENHEIT: '°F',
  
  // Body metrics
  KILOGRAMS: 'kg',
  POUNDS: 'lbs',
  METERS: 'm',
  CENTIMETERS: 'cm',
  INCHES: 'in',
  FEET: 'ft',
  
  // Activity
  STEPS: 'count',
  KCAL: 'kcal',
  METERS_DISTANCE: 'm',
  KILOMETERS: 'km',
  MILES: 'mi',
  
  // Time
  MINUTES: 'min',
  HOURS: 'h',
  SECONDS: 's',
  
  // Percentage
  PERCENT: '%'
} as const;

/**
 * Default page sizes for different data types
 */
export const DEFAULT_PAGE_SIZES = {
  CONTINUOUS_METRICS: 100, // Heart rate, steps, etc.
  DISCRETE_METRICS: 50,    // Weight, height, etc.
  SLEEP_DATA: 30,          // Sleep sessions
  WORKOUT_DATA: 20         // Workout sessions
} as const;