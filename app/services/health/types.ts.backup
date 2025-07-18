import type { AnyMap } from 'react-native-nitro-modules';


/*
    Base type definitions for health dataz
*/
// Base unified health data interface


export interface HealthDataAdapter {
  // Core fields (normalized across platforms)
  readonly uuid: string;
  readonly deviceManf: string;
  readonly deviceModel: string;
  readonly dataType: string;
  
  // Temporal attributes
  readonly startDate: string;
  readonly endDate: string;
  readonly timezone: string;
  
  // Data attributes
  readonly amount: number;
  readonly unit: string;
  readonly dataOrigin: string; // packageName/bundleId
  
  // Platform-specific extensions
  readonly platformData?: PlatformSpecificData;
}

// Discriminated union for platform-specific data
export type PlatformSpecificData = 
  | { platform: 'ios'; data: IOSHealthData }
  | { platform: 'android'; data: AndroidHealthData };

// iOS-specific data that doesn't map cleanly
export interface IOSHealthData {
  readonly device?: IOSDevice;
  readonly quantityType?: any; // HKQuantityType
  readonly metadata?: AnyMap;
  readonly sourceRevision?: IOSSourceRevision;
  readonly sampleType?: string;
}

// Android-specific data
export interface AndroidHealthData {
  readonly metadata?: AnyMap;
  readonly dataPointType?: string;
  readonly originalDataFormat?: string;
  readonly dataCollector?: AndroidDataCollector;
}

// -------Platform-specific complex types
export interface IOSDevice {
  readonly name?: string;
  readonly manufacturer?: string;
  readonly model?: string;
  readonly hardwareVersion?: string;
  readonly firmwareVersion?: string;
  readonly softwareVersion?: string;
  readonly localIdentifier?: string;
  readonly udiDeviceIdentifier?: string;
}

export interface IOSSourceRevision {
  readonly source: {
    readonly name: string;
    readonly bundleIdentifier: string;
  };
  readonly version?: string;
  readonly productType?: string;
  readonly systemVersion?: string;
  readonly operatingSystemVersion?: {
    readonly majorVersion: number;
    readonly minorVersion: number;
    readonly patchVersion: number;
  };
}

export interface AndroidDataCollector {
  readonly appPackageName?: string;
  readonly dataStreamId?: string;
  readonly dataStreamName?: string;
  readonly type?: number;
  readonly device?: {
    readonly uid?: string;
    readonly type?: number;
    readonly manufacturer?: string;
    readonly model?: string;
    readonly version?: string;
  };
}


/*

Query filters for IOS AND ANDROID
===============================================================

*/


// Filter types based on react-native-healthkit
export type PredicateWithUUID = {
  readonly uuid: string;
};

export type PredicateWithUUIDs = {
  readonly uuids: readonly string[];
};

export type PredicateWithStartAndEnd = {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly strictEndDate?: boolean;
  readonly strictStartDate?: boolean;
};

export type PredicateWithMetadataKey = {
  readonly withMetadataKey: string;
};

export type FilterForSamplesAnd = {
  readonly AND: PredicateForSamples[];
};

export type FilterForSamplesOr = {
  readonly OR: PredicateForSamples[];
};

export type PredicateFromWorkout = {
  readonly workout: any; // WorkoutProxy type from healthkit
};

export type FilterForSamples = PredicateForSamples | FilterForSamplesAnd | FilterForSamplesOr;

export type PredicateForSamples = 
  | PredicateWithUUID 
  | PredicateWithUUIDs 
  | PredicateWithMetadataKey 
  | PredicateWithStartAndEnd 
  | PredicateFromWorkout;

// Generic query options from react-native-healthkit
export interface GenericQueryOptions {
  filter?: FilterForSamples;
  readonly limit?: number;
}

export interface QueryOptionsWithAnchor extends GenericQueryOptions {
  readonly anchor?: string;
}

export interface QueryOptionsWithSortOrder extends GenericQueryOptions {
  readonly ascending?: boolean;
}

export interface QueryOptionsWithSortOrderAndUnit extends QueryOptionsWithSortOrder {
  readonly unit?: string;
}

export interface QueryOptionsWithAnchorAndUnit extends QueryOptionsWithAnchor {
  readonly unit?: string;
}

// Query params with platform awareness
export interface QueryParams {
  // Common params - now optional since we can use filters
  startDate?: Date;
  endDate?: Date;
  pageSize?: number;
  
  // iOS-specific query options aligned with react-native-healthkit
  ios?: QueryOptionsWithSortOrderAndUnit & {
    filter?: FilterForSamples;
    anchor?: string; // For pagination
  };
  
  android?: {
    dataOriginFilter?: string[]; // package names
    metadataFilter?: AnyMap;
    pageToken?: string;
  };
}

// Enums remain the same
export enum AuthorizationRequestStatus {
  unknown = 0,
  shouldRequest = 1,
  unnecessary = 2
}

export enum AuthorizationStatus {
  notDetermined = 0,
  sharingDenied = 1,
  sharingAuthorized = 2
}

// Enhanced hook interface
export interface HealthServiceHook {
  isAvailable: boolean;
  platform: 'ios' | 'android' | null;

  authStatus: AuthorizationRequestStatus;
  requestAuth: (dataTypes?: string[]) => Promise<AuthorizationRequestStatus>;
  AuthorizationRequestStatus: typeof AuthorizationRequestStatus;
  
  // Basic query (returns normalized data)
  getHealthData: (
    dataType: string,
    params: QueryParams
  ) => Promise<HealthDataAdapter[]>;
  
  getBatchData: (
    dataTypes: string[],
    params: QueryParams
  ) => Promise<Record<string, HealthDataAdapter[]>>;

  // Platform-specific query (when you need full platform features)
  getPlatformHealthData?: <T = any>(
    dataType: string,
    params: QueryParams
  ) => Promise<T[]>;
}

// Helper type guards
export const isIOSData = (
  data: PlatformSpecificData
): data is { platform: 'ios'; data: IOSHealthData } => {
  return data.platform === 'ios';
};

export const isAndroidData = (
  data: PlatformSpecificData
): data is { platform: 'android'; data: AndroidHealthData } => {
  return data.platform === 'android';
};

// Filter builder helpers used for IOS
export const Filters = {
  // Basic filters
  uuid: (uuid: string): PredicateWithUUID => ({ uuid }),
  uuids: (uuids: string[]): PredicateWithUUIDs => ({ uuids }),
  metadataKey: (key: string): PredicateWithMetadataKey => ({ withMetadataKey: key }),
  dateRange: (options: {
    startDate?: Date;
    endDate?: Date;
    strictStartDate?: boolean;
    strictEndDate?: boolean;
  }): PredicateWithStartAndEnd => options,
  workout: (workout: any): PredicateFromWorkout => ({ workout }),
  
  // Composite filters
  and: (...predicates: PredicateForSamples[]): FilterForSamplesAnd => ({ AND: predicates }),
  or: (...predicates: PredicateForSamples[]): FilterForSamplesOr => ({ OR: predicates }),
  
  // Common presets
  today: (): PredicateWithStartAndEnd => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  },
  
  lastDays: (days: number): PredicateWithStartAndEnd => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { startDate: start, endDate: end };
  },
  
  excludeManualEntries: (): FilterForSamplesOr => ({
    OR: [
      { withMetadataKey: 'HKMetadataKeyDeviceSerialNumber' },
      { withMetadataKey: 'HKMetadataKeyDigitallySigned' }
    ]
  })
};

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTHKIT TYPES (from react-native-healthkit library)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * HealthKit WorkoutEvent type
 */
export interface HKWorkoutEvent {
  readonly uuid: string;
  readonly type: number;
  readonly date: Date;
  readonly duration?: number;
  readonly metadata?: AnyMap;
}

/**
 * HealthKit Device type (compatible with library)
 */
export interface HKDevice {
  readonly name?: string | null;
  readonly manufacturer?: string | null;
  readonly model?: string | null;
  readonly hardwareVersion?: string | null;
  readonly firmwareVersion?: string | null;
  readonly softwareVersion?: string | null;
  readonly localIdentifier?: string | null;
  readonly udiDeviceIdentifier?: string | null;
}

/**
 * HealthKit SourceRevision type (compatible with library)
 */
export interface HKSourceRevision {
  readonly source?: {
    readonly name?: string;
    readonly bundleIdentifier?: string;
  };
  readonly version?: string;
  readonly productType?: string;
  readonly operatingSystemVersion?: any;
}

/**
 * Workout metric type unions that are properly assignable
 */
export type WorkoutMetricDataType = 
  | 'heartRate'
  | 'distance' 
  | 'activeCalories'
  | 'speed'
  | 'stepCount'
  | 'power'
  | 'cadence'
  | 'elevation'
  | 'temperature';

/**
 * Base metric record with proper typing
 */
export interface BaseMetricRecord extends HealthDataAdapter {
  readonly associatedWorkout?: string;
}

/**
 * Specific metric types with exact dataType values
 */
export interface HeartRateRecord extends BaseMetricRecord {
  readonly dataType: 'heartRate';
  readonly unit: 'bpm';
}

export interface DistanceRecord extends BaseMetricRecord {
  readonly dataType: 'distance';
  readonly unit: 'm';
}

export interface ActiveCaloriesRecord extends BaseMetricRecord {
  readonly dataType: 'activeCalories';
  readonly unit: 'kcal';
}

export interface SpeedRecord extends BaseMetricRecord {
  readonly dataType: 'speed';
  readonly unit: 'm/s';
}

export interface StepCountRecord extends BaseMetricRecord {
  readonly dataType: 'stepCount';
  readonly unit: 'count';
}

export interface PowerRecord extends BaseMetricRecord {
  readonly dataType: 'power';
  readonly unit: 'W';
}

export interface CadenceRecord extends BaseMetricRecord {
  readonly dataType: 'cadence';
  readonly unit: 'rpm' | 'spm';
}

/**
 * Union type for all workout metric records
 */
export type WorkoutMetricRecord = 
  | HeartRateRecord
  | DistanceRecord
  | ActiveCaloriesRecord
  | SpeedRecord
  | StepCountRecord
  | PowerRecord
  | CadenceRecord;

/**
 * Helper function to convert HealthKit types to our unified format
 */
export const convertHKDeviceToIOSDevice = (device?: HKDevice): IOSDevice | undefined => {
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

export const convertHKSourceRevisionToIOSSourceRevision = (sourceRevision?: HKSourceRevision): IOSSourceRevision | undefined => {
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
 * Helper function to convert WorkoutSample to RawWorkout format
 */
export const convertWorkoutSampleToRaw = (workoutSample: any): any => {
  return {
    id: workoutSample.uuid,
    activityType: workoutSample.workoutActivityType,
    startDate: workoutSample.startDate.toISOString(),
    endDate: workoutSample.endDate.toISOString(),
    duration: workoutSample.duration.quantity, // duration is a Quantity object with quantity property
    totalEnergyBurned: workoutSample.totalEnergyBurned?.quantity,
    totalDistance: workoutSample.totalDistance?.quantity,
    totalSwimmingStrokeCount: workoutSample.totalSwimmingStrokeCount?.quantity,
    totalFlightsClimbed: workoutSample.totalFlightsClimbed?.quantity,
    workoutEvents: workoutSample.events,
    route: undefined, // WorkoutSample doesn't directly include route - would need separate query
    device: workoutSample.device,
    metadata: workoutSample.metadata,
    sourceRevision: workoutSample.sourceRevision
  };
};

/**
 * Maps our unified WorkoutMetricDataType to HealthKit quantity type identifiers
 */
export const mapMetricTypeToHealthKit = (metricType: string): string | null => {
  const mapping: Record<string, string> = {
    'heartRate': 'HKQuantityTypeIdentifierHeartRate',
    'distance': 'HKQuantityTypeIdentifierDistanceWalkingRunning',
    'activeCalories': 'HKQuantityTypeIdentifierActiveEnergyBurned',
    'speed': 'HKQuantityTypeIdentifierRunningSpeed',
    'stepCount': 'HKQuantityTypeIdentifierStepCount',
    'power': 'HKQuantityTypeIdentifierCyclingPower',
    'cadence': 'HKQuantityTypeIdentifierRunningCadence',
    'elevation': 'HKQuantityTypeIdentifierElevation', 
    'temperature': 'HKQuantityTypeIdentifierBodyTemperature'
  };
  
  return mapping[metricType] || null;
};
