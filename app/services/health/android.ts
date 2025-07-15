// services/HealthService.android.ts
import { useState, useEffect } from 'react';
import { 
  initialize, 
  requestPermission, 
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import type { ReadRecordsOptions } from 'react-native-health-connect';
import { 
  HealthDataAdapter, 
  QueryParams, 
  AuthorizationRequestStatus,
  AndroidHealthData,
  PlatformSpecificData 
} from './types';

// Import workout-specific types and interfaces
import type {
  WorkoutHealthService,
  WorkoutQueryParams,
  WorkoutQueryResult,
  WorkoutMetricQueryParams,
  CompositeWorkoutQueryResult,
  WorkoutStatsResult
} from './workout/queries';
import type {
  WorkoutSessionAdapter,
  CompositeWorkoutAdapter,
  AnyMetricRecordAdapter,
  WorkoutMetricType,
  WorkoutExerciseType
} from './workout/types';

// Helper function to convert Health Connect record to our unified format
const convertRecord = (record: any, dataType: string): HealthDataAdapter => {
  const platformData: PlatformSpecificData = {
    platform: 'android',
    data: {
      metadata: record.metadata,
      dataPointType: record.recordType,
      originalDataFormat: record.dataOrigin?.packageName,
      dataCollector: {
        appPackageName: record.dataOrigin?.packageName,
        dataStreamId: record.dataOrigin?.dataStreamId,
        dataStreamName: record.dataOrigin?.dataStreamName,
      },
    } as AndroidHealthData
  };

  return {
    uuid: record.recordId || `${record.startTime}-${record.endTime}-${dataType}`,
    deviceManf: record.device?.manufacturer || 'Unknown',
    deviceModel: record.device?.model || 'Unknown',
    dataType,
    startDate: new Date(record.startTime).toISOString(),
    endDate: new Date(record.endTime).toISOString(),
    timezone: record.zoneOffset || Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: getRecordValue(record, dataType),
    unit: getRecordUnit(record, dataType),
    dataOrigin: record.dataOrigin?.packageName || 'Unknown',
    platformData,
  };
};

// Helper function to extract value from different record types
const getRecordValue = (record: any, dataType: string): number => {
  switch (dataType) {
    case 'steps':
      return record.count || 0;
    case 'distance':
      return record.distance?.inMeters || 0;
    case 'calories':
      return record.energy?.inCalories || 0;
    case 'walkingSpeed':
    case 'runningSpeed':
      return record.speed?.inMetersPerSecond || 0;
    default:
      return record.value || record.count || 0;
  }
};

// Helper function to get unit for different record types
const getRecordUnit = (record: any, dataType: string): string => {
  switch (dataType) {
    case 'steps':
      return 'count';
    case 'distance':
      return 'meters';
    case 'calories':
      return 'calories';
    case 'walkingSpeed':
    case 'runningSpeed':
      return 'm/s';
    default:
      return record.unit || 'unknown';
  }
};

export const useHealthService = (): WorkoutHealthService => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthorizationRequestStatus>(
    AuthorizationRequestStatus.unknown
  );

  useEffect(() => {
    const initializeHealthConnect = async () => {
      try {
        const isInitialized = await initialize();
        if (isInitialized) {
          const status = await getSdkStatus();
          setIsAvailable(status === SdkAvailabilityStatus.SDK_AVAILABLE);
        }
      } catch (error) {
        console.error('Failed to initialize Health Connect:', error);
        setIsAvailable(false);
      }
    };

    initializeHealthConnect();
  }, []);

  const requestAuth = async (dataTypes?: string[]): Promise<AuthorizationRequestStatus> => {
    try {
      const permissions = dataTypes ? 
        dataTypes.map(mapToHealthConnectPermission) : 
        [
          { accessType: 'read' as const, recordType: 'Steps' as const },
          { accessType: 'read' as const, recordType: 'Distance' as const },
          { accessType: 'read' as const, recordType: 'TotalCaloriesBurned' as const },
          { accessType: 'read' as const, recordType: 'Speed' as const },
        ];

      const result = await requestPermission(permissions);
      const newStatus = result.length > 0 ? 
        AuthorizationRequestStatus.unnecessary : 
        AuthorizationRequestStatus.shouldRequest;
      
      setAuthStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setAuthStatus(AuthorizationRequestStatus.shouldRequest);
      return AuthorizationRequestStatus.shouldRequest;
    }
  };

  const getHealthData = async (
    dataType: string,
    params: QueryParams
  ): Promise<HealthDataAdapter[]> => {
    try {
      const recordType = mapToHealthConnectRecordType(dataType);
      
      // Build time range filter from params
      if (!params.startDate || !params.endDate) {
        throw new Error('startDate and endDate are required for Android Health Connect');
      }

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: params.startDate.toISOString(),
        endTime: params.endDate.toISOString(),
      };

      // Build read options using the correct interface
      const readOptions = {
        timeRangeFilter,
        ...(params.android?.dataOriginFilter && { dataOriginFilter: params.android.dataOriginFilter }),
        ...(params.android?.pageToken && { pageToken: params.android.pageToken }),
        ...(params.pageSize && { pageSize: params.pageSize }),
      };

      const result = await readRecords(recordType, readOptions);

      return result.records.map((record: any) => convertRecord(record, dataType));
    } catch (error) {
      console.error(`Error fetching ${dataType} data:`, error);
      return [];
    }
  };

  const getBatchData = async (
    dataTypes: string[],
    params: QueryParams
  ): Promise<Record<string, HealthDataAdapter[]>> => {
    const results: Record<string, HealthDataAdapter[]> = {};
    
    await Promise.all(
      dataTypes.map(async (dataType) => {
        results[dataType] = await getHealthData(dataType, params);
      })
    );
    
    return results;
  };

  const getPlatformHealthData = async <T = any>(
    dataType: string,
    params: QueryParams
  ): Promise<T[]> => {
    try {
      const recordType = mapToHealthConnectRecordType(dataType);
      
      // Build time range filter from params
      if (!params.startDate || !params.endDate) {
        throw new Error('startDate and endDate are required for Android Health Connect');
      }

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: params.startDate.toISOString(),
        endTime: params.endDate.toISOString(),
      };

      // Build read options using the correct interface
      const readOptions = {
        timeRangeFilter,
        ...(params.android?.dataOriginFilter && { dataOriginFilter: params.android.dataOriginFilter }),
        ...(params.android?.pageToken && { pageToken: params.android.pageToken }),
        ...(params.pageSize && { pageSize: params.pageSize }),
      };

      const result = await readRecords(recordType, readOptions);

      return result.records as T[];
    } catch (error) {
      console.error(`Error fetching platform-specific ${dataType} data:`, error);
      return [];
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // WORKOUT-SPECIFIC METHODS (STUB IMPLEMENTATIONS FOR ANDROID)
  // ═══════════════════════════════════════════════════════════════════════════════
  // Note: Android workout implementation would require more work with Health Connect
  // For now, these are stub implementations that return empty results

  const getWorkoutSessions = async (params: WorkoutQueryParams): Promise<WorkoutQueryResult> => {
    console.warn('Android workout sessions not yet implemented');
    return {
      sessions: [],
      metadata: {
        queryTime: Date.now(),
        platform: 'android',
        dataTypes: ['workoutSession']
      }
    };
  };

  const getWorkoutSession = async (
    workoutId: string, 
    params?: Partial<WorkoutQueryParams>
  ): Promise<WorkoutSessionAdapter | null> => {
    console.warn('Android workout session not yet implemented');
    return null;
  };

  const getWorkoutMetrics = async (
    params: WorkoutMetricQueryParams
  ): Promise<Record<WorkoutMetricType, AnyMetricRecordAdapter[]>> => {
    console.warn('Android workout metrics not yet implemented');
    return {} as Record<WorkoutMetricType, AnyMetricRecordAdapter[]>;
  };

  const getCompositeWorkouts = async (
    params: WorkoutQueryParams
  ): Promise<CompositeWorkoutQueryResult> => {
    console.warn('Android composite workouts not yet implemented');
    return {
      workouts: [],
      metadata: {
        queryTime: Date.now(),
        platform: 'android',
        metricsIncluded: []
      }
    };
  };

  const getCompositeWorkout = async (
    workoutId: string,
    params?: Partial<WorkoutQueryParams>
  ): Promise<CompositeWorkoutAdapter | null> => {
    console.warn('Android composite workout not yet implemented');
    return null;
  };

  const getWorkoutStats = async (
    params: WorkoutQueryParams & { 
      groupBy?: 'day' | 'week' | 'month' | 'year';
      includeAvg?: boolean;
      includeMax?: boolean;
      includeTotal?: boolean;
    }
  ): Promise<WorkoutStatsResult> => {
    console.warn('Android workout stats not yet implemented');
    return {
      period: {
        startDate: params.startDate?.toISOString() || '',
        endDate: params.endDate?.toISOString() || '',
        groupBy: params.groupBy || 'day'
      },
      buckets: [],
      totals: {
        totalWorkouts: 0,
        totalDuration: 0,
        totalDistance: 0,
        totalCalories: 0,
        avgDuration: 0
      },
      byExerciseType: {} as Record<WorkoutExerciseType, any>
    };
  };

  const getWorkoutSummariesByType = async (
    params: WorkoutQueryParams
  ): Promise<Record<WorkoutExerciseType, any>> => {
    console.warn('Android workout summaries not yet implemented');
    return {} as Record<WorkoutExerciseType, any>;
  };

  const getPlatformWorkoutData = async <T = any>(
    workoutId: string,
    params?: Record<string, any>
  ): Promise<T | null> => {
    console.warn('Android platform workout data not yet implemented');
    return null;
  };

  return {
    isAvailable,
    platform: 'android',
    authStatus,
    requestAuth,
    AuthorizationRequestStatus,
    getHealthData,
    getBatchData,
    getPlatformHealthData,
    
    // Workout methods (stub implementations)
    getWorkoutSessions,
    getWorkoutSession,
    getWorkoutMetrics,
    getCompositeWorkouts,
    getCompositeWorkout,
    getWorkoutStats,
    getWorkoutSummariesByType,
    getPlatformWorkoutData,
  };
};

// Helper function to map generic data types to Health Connect record types
const mapToHealthConnectRecordType = (dataType: string): RecordType => {
  const mapping: Record<string, RecordType> = {
    'steps': 'Steps',
    'distance': 'Distance',
    'calories': 'TotalCaloriesBurned',
    'walkingSpeed': 'Speed',
    'runningSpeed': 'Speed',
    'heartRate': 'HeartRate',
  };
  
  return mapping[dataType] || 'Steps';
};

// Helper function to map generic data types to Health Connect permissions
const mapToHealthConnectPermission = (dataType: string): { accessType: 'read'; recordType: RecordType } => {
  const mapping: Record<string, { accessType: 'read'; recordType: RecordType }> = {
    'steps': { accessType: 'read' as const, recordType: 'Steps' },
    'distance': { accessType: 'read' as const, recordType: 'Distance' },
    'calories': { accessType: 'read' as const, recordType: 'TotalCaloriesBurned' },
    'walkingSpeed': { accessType: 'read' as const, recordType: 'Speed' },
    'runningSpeed': { accessType: 'read' as const, recordType: 'Speed' },
    'heartRate': { accessType: 'read' as const, recordType: 'HeartRate' },
  };
  
  return mapping[dataType] || { accessType: 'read' as const, recordType: 'Steps' };
};