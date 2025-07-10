// services/health/service.ts
import { Platform } from 'react-native';
import { useHealthService as useIOSHealthService } from './ios';
import { useHealthService as useAndroidHealthService } from './android';
import type { HealthServiceHook } from './types';
import type { WorkoutHealthService } from './workout/queries';
import type { WorkoutExerciseType } from './workout/types';

/**
 * Platform-agnostic health service hook
 * Automatically selects the appropriate platform implementation
 */
export const useHealthService = (): WorkoutHealthService => {
  if (Platform.OS === 'ios') {
    return useIOSHealthService();
  } else if (Platform.OS === 'android') {
    return useAndroidHealthService();
  } else {
    // Fallback for unsupported platforms (web, etc.)
    return {
      isAvailable: false,
      platform: null,
      authStatus: 0, // unknown
      requestAuth: async () => 0,
      AuthorizationRequestStatus: {
        unknown: 0,
        shouldRequest: 1,
        unnecessary: 2
      },
      getHealthData: async () => [],
      getBatchData: async () => ({}),
      getPlatformHealthData: async () => [],
      
      // Workout methods (no-op implementations)
      getWorkoutSessions: async () => ({ 
        sessions: [], 
        metadata: { queryTime: Date.now(), platform: 'ios', dataTypes: [] } 
      }),
      getWorkoutSession: async () => null,
      getWorkoutMetrics: async () => ({} as any),
      getCompositeWorkouts: async () => ({ 
        workouts: [], 
        metadata: { queryTime: Date.now(), platform: 'ios', metricsIncluded: [] } 
      }),
      getCompositeWorkout: async () => null,
      getWorkoutStats: async () => ({
        period: { startDate: '', endDate: '', groupBy: 'day' as const },
        buckets: [],
        totals: { totalWorkouts: 0, totalDuration: 0, avgDuration: 0 },
        byExerciseType: {} as Record<WorkoutExerciseType, any>
      }),
      getWorkoutSummariesByType: async () => ({} as any),
      getPlatformWorkoutData: async () => null,
    };
  }
};

/**
 * Get platform-specific health service directly
 * Use this when you need platform-specific features
 */
export const getPlatformHealthService = (platform: 'ios' | 'android'): WorkoutHealthService => {
  if (platform === 'ios') {
    return useIOSHealthService();
  } else {
    return useAndroidHealthService();
  }
};

// Re-export platform-specific services for direct access if needed
export { useHealthService as useIOSHealthService } from './ios';
export { useHealthService as useAndroidHealthService } from './android';