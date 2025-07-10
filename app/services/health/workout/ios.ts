import type { AnyMap } from 'react-native-nitro-modules';
import type {
  WorkoutSessionAdapter,
  WorkoutSegmentAdapter,
  WorkoutLapAdapter,
  WorkoutEventAdapter,
  WorkoutRouteAdapter,
  WorkoutLocationAdapter,
  MetricRecordAdapter,
  HeartRateRecordAdapter,
  DistanceRecordAdapter,
  ActiveCaloriesRecordAdapter,
  SpeedRecordAdapter,
  StepCountRecordAdapter,
  PowerRecordAdapter,
  CadenceRecordAdapter,
  CompositeWorkoutAdapter,
  IOSWorkoutData,
  IOSWorkoutEvent
} from './types';

import {
  WorkoutExerciseType,
  WorkoutEventType
} from './types';
import type { IOSDevice, IOSSourceRevision } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// RAW HEALTHKIT TYPES (from your provided structure)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Raw HealthKit HKWorkout
 */
export interface RawWorkout {
  readonly id: string;
  readonly activityType: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly duration: number;
  readonly totalEnergyBurned?: number;
  readonly totalDistance?: number;
  readonly totalSwimmingStrokeCount?: number;
  readonly totalFlightsClimbed?: number;
  readonly workoutEvents?: RawWorkoutEvent[];
  readonly route?: RawRoute;
  readonly device?: IOSDevice;
  readonly metadata?: AnyMap;
  readonly sourceRevision?: IOSSourceRevision;
}

/**
 * Raw HealthKit HKWorkoutEvent
 */
export interface RawWorkoutEvent {
  readonly type: number;
  readonly date: string;
  readonly duration?: number;
  readonly metadata?: AnyMap;
}

/**
 * Raw HealthKit HKRoute
 */
export interface RawRoute {
  readonly id: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly locations: RawLocation[];
}

/**
 * Raw HealthKit CLLocation
 */
export interface RawLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude?: number;
  readonly course?: number;
  readonly speed?: number;
  readonly timestamp: string;
}

/**
 * Raw HealthKit HKQuantitySample
 */
export interface RawQuantitySample {
  readonly id: string;
  readonly quantityType: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly quantity: number;
  readonly unit: string;
  readonly device?: IOSDevice;
  readonly metadata?: AnyMap;
  readonly sourceRevision?: IOSSourceRevision;
}

/**
 * Raw HealthKit HKActivitySummary
 */
export interface RawActivitySummary {
  readonly dateComponents: {
    readonly year: number;
    readonly month: number;
    readonly day: number;
  };
  readonly activeEnergyBurned: number;
  readonly appleExerciseTime: number;
  readonly appleStandHours: number;
  readonly metadata?: AnyMap;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTHKIT CONSTANTS & MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * HealthKit HKWorkoutActivityType mapping to unified types
 */
export const HEALTHKIT_ACTIVITY_TYPE_MAP: Record<number, WorkoutExerciseType> = {
  1: WorkoutExerciseType.RUNNING,
  2: WorkoutExerciseType.WALKING,
  3: WorkoutExerciseType.CYCLING,
  4: WorkoutExerciseType.SWIMMING,
  5: WorkoutExerciseType.TENNIS,
  6: WorkoutExerciseType.BASKETBALL,
  7: WorkoutExerciseType.FOOTBALL,
  8: WorkoutExerciseType.SOCCER,
  9: WorkoutExerciseType.BASEBALL,
  10: WorkoutExerciseType.HIKING,
  11: WorkoutExerciseType.STRENGTH_TRAINING,
  12: WorkoutExerciseType.YOGA,
  13: WorkoutExerciseType.DANCING,
  14: WorkoutExerciseType.ROWING,
  15: WorkoutExerciseType.ELLIPTICAL,
  16: WorkoutExerciseType.STAIR_CLIMBING,
  17: WorkoutExerciseType.GOLF,
  18: WorkoutExerciseType.PILATES,
  19: WorkoutExerciseType.MARTIAL_ARTS,
  20: WorkoutExerciseType.BOXING,
  21: WorkoutExerciseType.CLIMBING,
  3000: WorkoutExerciseType.OTHER
};

/**
 * HealthKit HKWorkoutEventType mapping
 */
export const HEALTHKIT_EVENT_TYPE_MAP: Record<number, WorkoutEventType> = {
  1: WorkoutEventType.PAUSE,
  2: WorkoutEventType.RESUME,
  3: WorkoutEventType.LAP,
  4: WorkoutEventType.SEGMENT,
  5: WorkoutEventType.MARKER
};

/**
 * HealthKit quantity type identifiers
 */
export const HEALTHKIT_QUANTITY_TYPES = {
  HEART_RATE: 'HKQuantityTypeIdentifierHeartRate',
  DISTANCE_WALKING_RUNNING: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  DISTANCE_CYCLING: 'HKQuantityTypeIdentifierDistanceCycling',
  DISTANCE_SWIMMING: 'HKQuantityTypeIdentifierDistanceSwimming',
  ACTIVE_ENERGY_BURNED: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  STEP_COUNT: 'HKQuantityTypeIdentifierStepCount',
  CYCLING_SPEED: 'HKQuantityTypeIdentifierCyclingSpeed',
  RUNNING_SPEED: 'HKQuantityTypeIdentifierRunningSpeed',
  CYCLING_POWER: 'HKQuantityTypeIdentifierCyclingPower',
  CYCLING_CADENCE: 'HKQuantityTypeIdentifierCyclingCadence',
  RUNNING_CADENCE: 'HKQuantityTypeIdentifierRunningCadence'
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Converts raw HealthKit HKWorkout to unified WorkoutSessionAdapter
 */
export function adaptHealthKitWorkout(raw: RawWorkout): WorkoutSessionAdapter {
  const exerciseType = HEALTHKIT_ACTIVITY_TYPE_MAP[raw.activityType] || WorkoutExerciseType.OTHER;
  
  return {
    // HealthDataAdapter fields
    uuid: raw.id,
    deviceManf: raw.device?.manufacturer || 'Apple',
    deviceModel: raw.device?.model || 'iPhone',
    dataType: 'workoutSession',
    startDate: raw.startDate,
    endDate: raw.endDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: raw.duration,
    unit: 'seconds',
    dataOrigin: raw.sourceRevision?.source.bundleIdentifier || 'com.apple.health',
    
    // WorkoutSessionAdapter fields
    exerciseType,
    duration: raw.duration,
    totalDistance: raw.totalDistance,
    totalActiveCalories: raw.totalEnergyBurned,
    totalEnergyBurned: raw.totalEnergyBurned,
    totalSwimmingStrokes: raw.totalSwimmingStrokeCount,
    totalFlightsClimbed: raw.totalFlightsClimbed,
    
    // Sub-components
    events: raw.workoutEvents?.map(adaptHealthKitEvent),
    route: raw.route ? adaptHealthKitRoute(raw.route) : undefined,
    laps: extractLapsFromEvents(raw.workoutEvents),
    
    // Platform-specific data
    platformData: {
      platform: 'ios',
      data: {
        device: raw.device,
        sourceRevision: raw.sourceRevision,
        metadata: raw.metadata,
        activityType: raw.activityType,
        workoutEvents: raw.workoutEvents?.map(event => ({
          type: event.type,
          date: event.date,
          duration: event.duration,
          metadata: event.metadata
        })),
        totalSwimmingStrokeCount: raw.totalSwimmingStrokeCount,
        totalFlightsClimbed: raw.totalFlightsClimbed
      } satisfies IOSWorkoutData
    }
  };
}

/**
 * Converts HealthKit workout event to unified format
 */
function adaptHealthKitEvent(event: RawWorkoutEvent): WorkoutEventAdapter {
  return {
    date: event.date,
    type: HEALTHKIT_EVENT_TYPE_MAP[event.type] || WorkoutEventType.MARKER,
    duration: event.duration,
    metadata: event.metadata
  };
}

/**
 * Converts HealthKit route to unified format
 */
function adaptHealthKitRoute(route: RawRoute): WorkoutRouteAdapter {
  return {
    startDate: route.startDate,
    endDate: route.endDate,
    locations: route.locations.map(adaptHealthKitLocation)
  };
}

/**
 * Converts HealthKit location to unified format
 */
function adaptHealthKitLocation(location: RawLocation): WorkoutLocationAdapter {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    altitude: location.altitude,
    speed: location.speed,
    course: location.course,
    timestamp: location.timestamp
  };
}

/**
 * Extracts lap information from workout events
 */
function extractLapsFromEvents(events?: RawWorkoutEvent[]): WorkoutLapAdapter[] {
  if (!events) return [];
  
  return events
    .filter(event => event.type === 3) // LAP events
    .map((event, index) => ({
      startDate: event.date,
      lapNumber: index + 1,
      metadata: event.metadata
    }));
}

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

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSITE WORKOUT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Combines workout session with related metrics into a composite object
 */
export function buildCompositeWorkoutFromHealthKit(
  session: WorkoutSessionAdapter,
  metrics: {
    heartRate?: HeartRateRecordAdapter[];
    distance?: DistanceRecordAdapter[];
    activeCalories?: ActiveCaloriesRecordAdapter[];
    speed?: SpeedRecordAdapter[];
    stepCount?: StepCountRecordAdapter[];
    power?: PowerRecordAdapter[];
    cadence?: CadenceRecordAdapter[];
  }
): CompositeWorkoutAdapter {
  // Calculate aggregated values
  const totalDistance = metrics.distance?.reduce((sum, record) => sum + record.amount, 0) || session.totalDistance;
  const totalCalories = metrics.activeCalories?.reduce((sum, record) => sum + record.amount, 0) || session.totalActiveCalories;
  
  const heartRates = metrics.heartRate?.map(r => r.amount) || [];
  const speeds = metrics.speed?.map(r => r.amount) || [];
  const powers = metrics.power?.map(r => r.amount) || [];
  const cadences = metrics.cadence?.map(r => r.amount) || [];
  
  const avgHeartRate = heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : undefined;
  const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : undefined;
  const minHeartRate = heartRates.length > 0 ? Math.min(...heartRates) : undefined;
  
  const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : undefined;
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : undefined;
  
  const avgPower = powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : undefined;
  const maxPower = powers.length > 0 ? Math.max(...powers) : undefined;
  
  const avgCadence = cadences.length > 0 ? cadences.reduce((a, b) => a + b, 0) / cadences.length : undefined;
  
  // Calculate heart rate zones (basic implementation)
  const heartRateZones = avgHeartRate ? calculateHeartRateZones(heartRates, session.duration) : undefined;
  
  return {
    session,
    totalDistanceMeters: totalDistance,
    totalActiveCalories: totalCalories,
    totalDurationSeconds: session.duration,
    
    avgHeartRate,
    maxHeartRate,
    minHeartRate,
    heartRateZones,
    
    avgSpeed,
    maxSpeed,
    avgPower,
    maxPower,
    avgCadence,
    
    heartRateRecords: metrics.heartRate,
    distanceRecords: metrics.distance,
    speedRecords: metrics.speed,
    powerRecords: metrics.power,
    cadenceRecords: metrics.cadence
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maps HealthKit quantity type to unified metric type
 */
function mapHealthKitQuantityType(quantityType: string): string {
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
 * Validates HealthKit workout data
 */
export function validateHealthKitWorkout(raw: RawWorkout): boolean {
  return !!(
    raw.id &&
    raw.startDate &&
    raw.endDate &&
    raw.duration > 0 &&
    raw.activityType &&
    new Date(raw.startDate).getTime() < new Date(raw.endDate).getTime()
  );
}

/**
 * Calculates basic heart rate zones
 */
function calculateHeartRateZones(heartRates: number[], totalDuration: number) {
  if (heartRates.length === 0) return undefined;
  
  const maxHR = Math.max(...heartRates);
  const zones = [
    { zone: 1, minBpm: 0, maxBpm: maxHR * 0.6 },
    { zone: 2, minBpm: maxHR * 0.6, maxBpm: maxHR * 0.7 },
    { zone: 3, minBpm: maxHR * 0.7, maxBpm: maxHR * 0.8 },
    { zone: 4, minBpm: maxHR * 0.8, maxBpm: maxHR * 0.9 },
    { zone: 5, minBpm: maxHR * 0.9, maxBpm: maxHR }
  ];
  
  return zones.map(zone => {
    const timeInZone = heartRates.filter(hr => hr >= zone.minBpm && hr <= zone.maxBpm).length;
    const percentage = (timeInZone / heartRates.length) * 100;
    
    return {
      zone: zone.zone,
      minBpm: Math.round(zone.minBpm),
      maxBpm: Math.round(zone.maxBpm),
      timeInZone: Math.round((timeInZone / heartRates.length) * totalDuration),
      percentage: Math.round(percentage)
    };
  });
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
 * Gets the appropriate distance quantity type for activity
 */
export function getDistanceQuantityTypeForActivity(activityType: number): string {
  switch (activityType) {
    case 3: // Cycling
      return HEALTHKIT_QUANTITY_TYPES.DISTANCE_CYCLING;
    case 4: // Swimming
      return HEALTHKIT_QUANTITY_TYPES.DISTANCE_SWIMMING;
    default:
      return HEALTHKIT_QUANTITY_TYPES.DISTANCE_WALKING_RUNNING;
  }
}