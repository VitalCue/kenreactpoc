// services/health/service.ts
import { Platform } from 'react-native';
import { useHealthService as useIOSHealthService } from './platforms/ios';
import { useWorkoutHealthService as useIOSWorkoutHealthService } from './platforms/ios/workout-service';
import { useHealthService as useAndroidHealthService } from './platforms/android';
import type { HealthServiceHook } from './types/service';
import type { WorkoutHealthService } from './workout/queries';
import { AuthorizationRequestStatus } from './types/auth';

/**
 * Platform-agnostic health service hook
 * Automatically selects the appropriate platform implementation
 * Now returns WorkoutHealthService which includes all workout methods
 */
export const useHealthService = (): WorkoutHealthService => {
  if (Platform.OS === 'ios') {
    return useIOSWorkoutHealthService();
  } else if (Platform.OS === 'android') {
    // For now, Android returns basic service cast as WorkoutHealthService
    // You'll need to implement Android workout service similarly
    return useAndroidHealthService() as unknown as WorkoutHealthService;
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
      getPlatformHealthData: async () => [],
      // Workout methods return empty results
      getWorkoutSessions: async () => ({ sessions: [], metadata: { queryTime: Date.now(), platform: null as any, dataTypes: [] } }),
      getWorkoutSession: async () => null,
      getWorkoutMetrics: async () => ({} as any),
      getCompositeWorkouts: async () => ({ workouts: [], metadata: { queryTime: Date.now(), platform: null as any, metricsIncluded: [] } }),
      getCompositeWorkout: async () => null,
      getWorkoutStats: async () => ({ period: {}, buckets: [], totals: {}, byExerciseType: {} } as any),
      getWorkoutSummariesByType: async () => ({} as any)
    } as WorkoutHealthService;
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