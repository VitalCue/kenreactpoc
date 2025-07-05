import type { AnyMap } from 'react-native-nitro-modules';

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

// Platform-specific complex types
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

// Query params with platform awareness
export interface QueryParams {
  // Common params
  startDate: Date;
  endDate: Date;
  pageSize?: number;
  
  // Platform-specific query options
  ios?: {
    device?: IOSDevice;
    source?: string; // bundle identifier
    sortDescriptors?: Array<{
      key: string;
      ascending: boolean;
    }>;
    predicate?: any; // NSPredicate
    limit?: number;
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

// past interface but was meant for apple health kit port
// export interface QuantitySample {
//     readonly uuid: string;
//     readonly device?: any; //Device object used by apple
//     readonly quantityType: any; //Object used by apple
//     readonly startDate: Date;
//     readonly endDate: Date;
//     readonly quantity: number;
//     readonly unit: string;
//     readonly metadata: AnyMap;
//     readonly sourceRevision?: any; //SourceRevision object used by apple
// }
