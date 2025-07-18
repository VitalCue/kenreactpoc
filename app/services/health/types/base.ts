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
    readonly platform?: string;
  };
}

/**
 * Type guards for platform-specific data
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