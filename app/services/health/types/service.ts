import type { HealthDataAdapter } from './base';
import type { AuthorizationRequestStatus } from './auth';
import type { QueryParams } from './query';

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