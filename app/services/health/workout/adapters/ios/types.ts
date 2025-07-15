import type { AnyMap } from 'react-native-nitro-modules';
import type { IOSDevice, IOSSourceRevision } from '../../../types';
import { WorkoutExerciseType, WorkoutEventType } from '../../constants';

// ═══════════════════════════════════════════════════════════════════════════════
// RAW HEALTHKIT TYPES
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
  readonly accuracy?: number;
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
  readonly activeEnergyBurned: number;
  readonly appleExerciseTime: number;
  readonly appleStandTime: number;
  readonly date: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTHKIT CONSTANTS & MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * HealthKit activity type constants mapped to unified exercise types
 */
/**
 * Apple HealthKit Activity Type mappings based on official HKWorkoutActivityType enum
 * Reference: https://developer.apple.com/documentation/healthkit/hkworkoutactivitytype
 */
export const HEALTHKIT_ACTIVITY_TYPE_MAP: Record<number, WorkoutExerciseType> = {
  // Core activities (1-20)
  1: WorkoutExerciseType.FOOTBALL,        // americanFootball
  2: WorkoutExerciseType.OTHER,           // archery  
  3: WorkoutExerciseType.FOOTBALL,        // australianFootball
  4: WorkoutExerciseType.OTHER,           // badminton
  5: WorkoutExerciseType.BASEBALL,        // baseball
  6: WorkoutExerciseType.BASKETBALL,      // basketball  
  7: WorkoutExerciseType.OTHER,           // bowling
  8: WorkoutExerciseType.BOXING,          // boxing
  9: WorkoutExerciseType.CLIMBING,        // climbing
  10: WorkoutExerciseType.OTHER,          // cricket
  11: WorkoutExerciseType.OTHER,          // crossTraining
  12: WorkoutExerciseType.OTHER,          // curling
  13: WorkoutExerciseType.CYCLING,        // cycling
  14: WorkoutExerciseType.DANCING,        // dance
  15: WorkoutExerciseType.DANCING,        // danceInspiredTraining
  16: WorkoutExerciseType.ELLIPTICAL,     // elliptical
  17: WorkoutExerciseType.OTHER,          // equestrianSports
  18: WorkoutExerciseType.OTHER,          // fencing
  19: WorkoutExerciseType.OTHER,          // fishing
  20: WorkoutExerciseType.STRENGTH_TRAINING, // functionalStrengthTraining
  
  // Sports and activities (21-40)
  21: WorkoutExerciseType.GOLF,           // golf
  22: WorkoutExerciseType.OTHER,          // gymnastics
  23: WorkoutExerciseType.OTHER,          // handball
  24: WorkoutExerciseType.HIKING,         // hiking
  25: WorkoutExerciseType.OTHER,          // hockey
  26: WorkoutExerciseType.OTHER,          // hunting
  27: WorkoutExerciseType.OTHER,          // lacrosse
  28: WorkoutExerciseType.MARTIAL_ARTS,   // martialArts
  29: WorkoutExerciseType.YOGA,           // mindAndBody
  30: WorkoutExerciseType.OTHER,          // mixedMetabolicCardioTraining
  31: WorkoutExerciseType.OTHER,          // paddleSports
  32: WorkoutExerciseType.OTHER,          // play
  33: WorkoutExerciseType.OTHER,          // preparationAndRecovery
  34: WorkoutExerciseType.OTHER,          // racquetball
  35: WorkoutExerciseType.ROWING,         // rowing
  36: WorkoutExerciseType.OTHER,          // rugby
  37: WorkoutExerciseType.RUNNING,        // running
  38: WorkoutExerciseType.OTHER,          // sailing
  39: WorkoutExerciseType.OTHER,          // skatingSports
  40: WorkoutExerciseType.OTHER,          // snowSports
  
  // More sports (41-60)
  41: WorkoutExerciseType.SOCCER,         // soccer
  42: WorkoutExerciseType.BASEBALL,       // softball
  43: WorkoutExerciseType.OTHER,          // squash
  44: WorkoutExerciseType.STAIR_CLIMBING, // stairClimbing
  45: WorkoutExerciseType.OTHER,          // surfingSports
  46: WorkoutExerciseType.SWIMMING,       // swimming
  47: WorkoutExerciseType.TENNIS,         // tableTennis
  48: WorkoutExerciseType.TENNIS,         // tennis
  49: WorkoutExerciseType.RUNNING,        // trackAndField
  50: WorkoutExerciseType.STRENGTH_TRAINING, // traditionalStrengthTraining
  51: WorkoutExerciseType.OTHER,          // volleyball
  52: WorkoutExerciseType.WALKING,        // walking
  53: WorkoutExerciseType.OTHER,          // waterFitness
  54: WorkoutExerciseType.OTHER,          // waterPolo
  55: WorkoutExerciseType.OTHER,          // waterSports
  56: WorkoutExerciseType.OTHER,          // wrestling
  57: WorkoutExerciseType.YOGA,           // yoga
  
  // Newer activity types (58+)
  58: WorkoutExerciseType.OTHER,          // barre
  59: WorkoutExerciseType.BODYWEIGHT,     // coreTraining
  60: WorkoutExerciseType.OTHER,          // crossCountrySkiing
  61: WorkoutExerciseType.OTHER,          // downhillSkiing
  62: WorkoutExerciseType.OTHER,          // flexibility
  63: WorkoutExerciseType.HIGH_INTENSITY_INTERVAL_TRAINING, // highIntensityIntervalTraining
  64: WorkoutExerciseType.OTHER,          // jumpRope
  65: WorkoutExerciseType.BOXING,         // kickboxing
  66: WorkoutExerciseType.PILATES,        // pilates
  67: WorkoutExerciseType.OTHER,          // snowboarding
  68: WorkoutExerciseType.STAIR_CLIMBING, // stairStepper
  69: WorkoutExerciseType.WALKING,        // wheelchairWalkPace
  70: WorkoutExerciseType.RUNNING,        // wheelchairRunPace
  71: WorkoutExerciseType.MARTIAL_ARTS,   // taiChi
  72: WorkoutExerciseType.OTHER,          // mixedCardio
  73: WorkoutExerciseType.CYCLING,        // handCycling
  74: WorkoutExerciseType.OTHER,          // discSports
  75: WorkoutExerciseType.OTHER,          // fitnessGaming
  76: WorkoutExerciseType.DANCING,        // cardioDance
  77: WorkoutExerciseType.DANCING,        // socialDance
  78: WorkoutExerciseType.OTHER,          // pickleball
  79: WorkoutExerciseType.OTHER,          // coolDown
  
  // Generic fallback
  3000: WorkoutExerciseType.OTHER         // other
};

/**
 * HealthKit event type constants mapped to unified event types
 */
export const HEALTHKIT_EVENT_TYPE_MAP: Record<number, WorkoutEventType> = {
  1: WorkoutEventType.PAUSE, // HKWorkoutEventTypePause
  2: WorkoutEventType.RESUME, // HKWorkoutEventTypeResume
  3: WorkoutEventType.LAP, // HKWorkoutEventTypeLap
  4: WorkoutEventType.SEGMENT, // HKWorkoutEventTypeSegment
  5: WorkoutEventType.MARKER // HKWorkoutEventTypeMarker
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
  RUNNING_SPEED: 'HKQuantityTypeIdentifierRunningSpeed',
  CYCLING_SPEED: 'HKQuantityTypeIdentifierCyclingSpeed',
  SWIMMING_STROKE_COUNT: 'HKQuantityTypeIdentifierSwimmingStrokeCount',
  CYCLING_POWER: 'HKQuantityTypeIdentifierCyclingPower',
  CYCLING_CADENCE: 'HKQuantityTypeIdentifierCyclingCadence',
  RUNNING_CADENCE: 'HKQuantityTypeIdentifierRunningCadence'
} as const;