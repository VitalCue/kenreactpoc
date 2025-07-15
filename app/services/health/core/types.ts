import type { AnyMap } from 'react-native-nitro-modules';

/**
 * Base unified health data interface - core structure for all health data
 */
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

/**
 * Discriminated union for platform-specific data
 */
export type PlatformSpecificData = 
  | { platform: 'ios'; data: IOSHealthData }
  | { platform: 'android'; data: AndroidHealthData };

/**
 * iOS-specific health data that doesn't map cleanly to unified format
 */
export interface IOSHealthData {
  readonly device?: IOSDevice;
  readonly quantityType?: any; // HKQuantityType
  readonly metadata?: AnyMap;
  readonly sourceRevision?: IOSSourceRevision;
  readonly sampleType?: string;
}

/**
 * Android-specific health data
 */
export interface AndroidHealthData {
  readonly metadata?: AnyMap;
  readonly dataPointType?: string;
  readonly originalDataFormat?: string;
  readonly dataCollector?: AndroidDataCollector;
}

/**
 * iOS HealthKit device information
 */
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

/**
 * iOS HealthKit source revision information
 */
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

/**
 * Android Health Connect data collector information
 */
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

/**
 * Authorization status enums
 */
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

/**
 * Core health service interface
 */
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

/**
 * Base query parameters interface
 */
export interface QueryParams {
  // Common params
  startDate?: Date;
  endDate?: Date;
  pageSize?: number;
  
  // iOS-specific query options
  ios?: {
    filter?: any; // FilterForSamples
    anchor?: string;
    limit?: number;
    ascending?: boolean;
    unit?: string;
  };
  
  // Android-specific query options
  android?: {
    dataOriginFilter?: string[];
    metadataFilter?: AnyMap;
    pageToken?: string;
  };
}

/**
 * Helper type guards
 */
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