// services/HealthService.ts
import { Platform } from 'react-native';
import { HealthServiceHook } from './HealthServices.types';

// Platform-specific imports
export const useHealthService = (): HealthServiceHook => {
  if (Platform.OS === 'ios') {
    const { useHealthService: useIOSHealthService } = require('./HealthService.ios');
    return useIOSHealthService();
  } else if (Platform.OS === 'android') {
    const { useHealthService: useAndroidHealthService } = require('./HealthService.android');
    return useAndroidHealthService();
  } else {
    // Web/unsupported platform fallback
    return {
      isAvailable: false,
      platform: null,
      authStatus: 0, // AuthorizationRequestStatus.unknown
      requestAuth: async () => 0,
      AuthorizationRequestStatus: {
        unknown: 0,
        shouldRequest: 1,
        unnecessary: 2
      },
      getHealthData: async () => [], 
      getBatchData: async () => ({}),
      getPlatformHealthData: async () => [],
    };
  }
};

export default useHealthService;