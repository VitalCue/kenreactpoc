import type { AnyMap } from 'react-native-nitro-modules';

/**
 * Common platform-specific data interfaces
 */
export interface PlatformDeviceInfo {
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
 * Common platform-specific source information
 */
export interface PlatformSourceInfo {
  readonly name: string;
  readonly bundleIdentifier: string;
  readonly version?: string;
  readonly productType?: string;
  readonly systemVersion?: string;
}

/**
 * Base platform metadata interface
 */
export interface BasePlatformMetadata {
  readonly metadata?: AnyMap;
  readonly timestamp?: Date;
  readonly sourceInfo?: PlatformSourceInfo;
  readonly deviceInfo?: PlatformDeviceInfo;
}