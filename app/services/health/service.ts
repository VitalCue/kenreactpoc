// services/health/service.ts
import { Platform } from 'react-native';
import { useHealthService as useIOSHealthService } from './platforms/ios';
import { useHealthService as useAndroidHealthService } from './platforms/android';
import type { HealthServiceHook } from './core/types';
import { AuthorizationRequestStatus } from './core/types';

/**
 * Platform-agnostic health service hook
 * Automatically selects the appropriate platform implementation
 */
export const useHealthService = (): HealthServiceHook => {
  if (Platform.OS === 'ios') {
    return useIOSHealthService();
  } else if (Platform.OS === 'android') {
    return useAndroidHealthService();
  } else {
    // Fallback for unsupported platforms (web, etc.)
    return {
      isAvailable: false,
      platform: null,
      authStatus: AuthorizationRequestStatus.unknown,
      requestAuth: async () => AuthorizationRequestStatus.unknown,
      AuthorizationRequestStatus,
      getHealthData: async () => [],
      getBatchData: async () => ({}),
      getPlatformHealthData: async () => []
    };
  }
};

/**
 * Get platform-specific health service directly
 * Use this when you need platform-specific features
 */
export const getPlatformHealthService = (platform: 'ios' | 'android'): HealthServiceHook => {
  if (platform === 'ios') {
    return useIOSHealthService();
  } else {
    return useAndroidHealthService();
  }
};

// Re-export platform-specific services for direct access if needed
export { useHealthService as useIOSHealthService } from './platforms/ios';
export { useHealthService as useAndroidHealthService } from './platforms/android';