import type {
  WorkoutSessionAdapter,
  WorkoutEventAdapter,
  WorkoutLapAdapter,
  IOSWorkoutData
} from '../../types';
import { WorkoutExerciseType, WorkoutEventType } from '../../constants';
import type { RawWorkout, RawWorkoutEvent } from './types';
import { HEALTHKIT_ACTIVITY_TYPE_MAP, HEALTHKIT_EVENT_TYPE_MAP } from './types';
import { adaptHealthKitRoute } from './routes';

/**
 * Converts raw HealthKit HKWorkout to unified WorkoutSessionAdapter
 */
export function adaptHealthKitWorkout(raw: RawWorkout): WorkoutSessionAdapter {
  const exerciseType = HEALTHKIT_ACTIVITY_TYPE_MAP[raw.activityType] || WorkoutExerciseType.OTHER;
  const bundleId = raw.sourceRevision?.source?.bundleIdentifier;
  
  // Debug logging - always show what's happening
  console.log(`🏃‍♂️ Activity type ${raw.activityType} -> ${exerciseType} (Source: ${bundleId})`);
  
  if (!HEALTHKIT_ACTIVITY_TYPE_MAP[raw.activityType]) {
    console.log(`❌ Unmapped activity type ${raw.activityType}, using OTHER`);
  }
  
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
export function adaptHealthKitEvent(event: RawWorkoutEvent): WorkoutEventAdapter {
  return {
    date: event.date,
    type: HEALTHKIT_EVENT_TYPE_MAP[event.type] || WorkoutEventType.MARKER,
    duration: event.duration,
    metadata: event.metadata
  };
}

/**
 * Extracts lap information from workout events
 */
export function extractLapsFromEvents(events?: RawWorkoutEvent[]): WorkoutLapAdapter[] {
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
 * Validates HealthKit workout data
 */
export function validateHealthKitWorkout(raw: RawWorkout): boolean {
  return !!(
    raw.id &&
    raw.startDate &&
    raw.endDate &&
    raw.duration > 0 &&
    typeof raw.activityType === 'number'
  );
}

/**
 * Gets the appropriate distance quantity type for a given activity
 */
export function getDistanceQuantityTypeForActivity(activityType: number): string | null {
  switch (activityType) {
    case 37: // Running
    case 52: // Walking
      return 'HKQuantityTypeIdentifierDistanceWalkingRunning';
    case 13: // Cycling
      return 'HKQuantityTypeIdentifierDistanceCycling';
    case 46: // Swimming
      return 'HKQuantityTypeIdentifierDistanceSwimming';
    default:
      return null;
  }
}