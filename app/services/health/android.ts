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
          { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
          { accessType: 'read' as const, recordType: 'HeartRate' as const },
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
      console.log('Raw Health Connect result for android.ts:', result);
      
      // Handle different possible response structures
      const records = result?.records || result || [];
      
      if (!Array.isArray(records)) {
        console.warn('Expected array of records, got:', typeof records, records);
        return [];
      }

      return records.map((record: any) => convertRecord(record, dataType));
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
      
      // Handle different possible response structures
      const records = result?.records || result || [];
      
      if (!Array.isArray(records)) {
        console.warn('Expected array of records, got:', typeof records, records);
        return [];
      }

      return records as T[];
    } catch (error) {
      console.error(`Error fetching platform-specific ${dataType} data:`, error);
      return [];
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // WORKOUT-SPECIFIC METHODS (HEALTH CONNECT IMPLEMENTATION)
  // ═══════════════════════════════════════════════════════════════════════════════

  const getWorkoutSessions = async (params: WorkoutQueryParams): Promise<WorkoutQueryResult> => {
    try {
      if (!isAvailable) {
        return {
          sessions: [],
          metadata: {
            queryTime: Date.now(),
            platform: 'android',
            dataTypes: ['workoutSession']
          }
        };
      }

      const recordType = 'ExerciseSession';
      
      if (!params.startDate || !params.endDate) {
        throw new Error('startDate and endDate are required for Android Health Connect');
      }

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: params.startDate.toISOString(),
        endTime: params.endDate.toISOString(),
      };

      const readOptions = {
        timeRangeFilter,
        ...(params.android?.dataOriginFilter && { dataOriginFilter: params.android.dataOriginFilter }),
        pageSize: params.pageSize || 100,
      };

      const result = await readRecords(recordType, readOptions);
      
      // Handle different possible response structures
      const records = result?.records || result || [];
      
      if (!Array.isArray(records)) {
        console.warn('Expected array of records, got:', typeof records, records);
        return {
          sessions: [],
          metadata: {
            queryTime: Date.now(),
            platform: 'android',
            dataTypes: ['workoutSession']
          }
        };
      }
      
      // Convert Health Connect exercise sessions to our unified format
      const sessions = records.map((record: any) => {
        const startDate = new Date(record.startTime);
        const endDate = new Date(record.endTime);
        const duration = (endDate.getTime() - startDate.getTime()) / 1000;
        
        return {
          uuid: record.recordId || `${record.startTime}-${record.endTime}-exercise`,
          deviceManf: record.device?.manufacturer || 'Unknown',
          deviceModel: record.device?.model || 'Unknown',
          dataType: 'workoutSession',
          startDate: record.startTime,
          endDate: record.endTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          amount: duration,
          unit: 'seconds',
          dataOrigin: record.dataOrigin?.packageName || 'Unknown',
          
          // WorkoutSessionAdapter specific fields
          exerciseType: record.exerciseType || 'OTHER',
          title: record.title,
          notes: record.notes,
          duration,
          
          platformData: {
            platform: 'android' as const,
            data: {
              metadata: record.metadata,
              dataPointType: 'ExerciseSessionRecord',
              originalDataFormat: 'health_connect'
            }
          }
        };
      });

      return {
        sessions,
        metadata: {
          queryTime: Date.now(),
          platform: 'android',
          dataTypes: ['workoutSession']
        }
      };
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
      return {
        sessions: [],
        metadata: {
          queryTime: Date.now(),
          platform: 'android',
          dataTypes: ['workoutSession']
        }
      };
    }
  };

  const getWorkoutSession = async (
    workoutId: string, 
    params?: Partial<WorkoutQueryParams>
  ): Promise<WorkoutSessionAdapter | null> => {
    try {
      if (!isAvailable) {
        return null;
      }

      // Create query params with fallback dates if not provided
      const queryParams = {
        startDate: params?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: params?.endDate || new Date(),
        pageSize: 1000,
        ...params
      };

      const result = await getWorkoutSessions(queryParams);
      
      // Find the specific workout by ID
      const session = result.sessions.find(s => s.uuid === workoutId);
      return session || null;
    } catch (error) {
      console.error('Error fetching workout session:', error);
      return null;
    }
  };

  const getWorkoutMetrics = async (
    params: WorkoutMetricQueryParams
  ): Promise<Record<WorkoutMetricType, AnyMetricRecordAdapter[]>> => {
    try {
      if (!isAvailable) {
        return {} as Record<WorkoutMetricType, AnyMetricRecordAdapter[]>;
      }

      const results: Record<string, any[]> = {};
      
      // Default metric types if not specified
      const metricTypes = params.metricTypes || ['heartRate', 'distance', 'speed', 'activeCalories'];

      // Query each metric type
      await Promise.all(
        metricTypes.map(async (metricType) => {
          const data = await getHealthData(metricType, {
            startDate: params.startDate,
            endDate: params.endDate,
            pageSize: params.pageSize || 1000,
            android: params.android
          });
          
          results[metricType] = data;
        })
      );

      return results as Record<WorkoutMetricType, AnyMetricRecordAdapter[]>;
    } catch (error) {
      console.error('Error fetching workout metrics:', error);
      return {} as Record<WorkoutMetricType, AnyMetricRecordAdapter[]>;
    }
  };

  const getCompositeWorkouts = async (
    params: WorkoutQueryParams
  ): Promise<CompositeWorkoutQueryResult> => {
    try {
      if (!isAvailable) {
        return {
          workouts: [],
          metadata: {
            queryTime: Date.now(),
            platform: 'android',
            metricsIncluded: []
          }
        };
      }

      // Get workout sessions
      const sessionResult = await getWorkoutSessions(params);
      
      // For each session, get associated metrics
      const workouts = await Promise.all(
        sessionResult.sessions.map(async (session) => {
          const metrics = await getWorkoutMetrics({
            startDate: new Date(session.startDate),
            endDate: new Date(session.endDate),
            metricTypes: ['heartRate', 'distance', 'speed', 'activeCalories', 'power'],
            android: params.android
          });

          // Calculate aggregated values
          const totalDistance = metrics.distance?.reduce((sum, record) => sum + record.amount, 0) || 0;
          const totalCalories = metrics.activeCalories?.reduce((sum, record) => sum + record.amount, 0) || 0;
          
          const heartRates = metrics.heartRate?.map(r => r.amount) || [];
          const speeds = metrics.speed?.map(r => r.amount) || [];
          const powers = metrics.power?.map(r => r.amount) || [];
          
          const avgHeartRate = heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : undefined;
          const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : undefined;
          const minHeartRate = heartRates.length > 0 ? Math.min(...heartRates) : undefined;
          
          const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : undefined;
          const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : undefined;
          
          const avgPower = powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : undefined;
          const maxPower = powers.length > 0 ? Math.max(...powers) : undefined;

          return {
            session,
            totalDistanceMeters: totalDistance,
            totalActiveCalories: totalCalories,
            totalDurationSeconds: session.duration,
            
            avgHeartRate,
            maxHeartRate,
            minHeartRate,
            
            avgSpeed,
            maxSpeed,
            avgPower,
            maxPower,
            
            heartRateRecords: metrics.heartRate,
            distanceRecords: metrics.distance,
            speedRecords: metrics.speed,
            powerRecords: metrics.power
          };
        })
      );

      return {
        workouts,
        metadata: {
          queryTime: Date.now(),
          platform: 'android',
          metricsIncluded: ['heartRate', 'distance', 'speed', 'activeCalories', 'power']
        }
      };
    } catch (error) {
      console.error('Error fetching composite workouts:', error);
      return {
        workouts: [],
        metadata: {
          queryTime: Date.now(),
          platform: 'android',
          metricsIncluded: []
        }
      };
    }
  };

  const getCompositeWorkout = async (
    workoutId: string,
    params?: Partial<WorkoutQueryParams>
  ): Promise<CompositeWorkoutAdapter | null> => {
    try {
      const session = await getWorkoutSession(workoutId, params);
      if (!session) {
        return null;
      }

      const metrics = await getWorkoutMetrics({
        startDate: new Date(session.startDate),
        endDate: new Date(session.endDate),
        metricTypes: ['heartRate', 'distance', 'speed', 'activeCalories', 'power'],
        android: params?.android
      });

      // Calculate aggregated values
      const totalDistance = metrics.distance?.reduce((sum, record) => sum + record.amount, 0) || 0;
      const totalCalories = metrics.activeCalories?.reduce((sum, record) => sum + record.amount, 0) || 0;
      
      const heartRates = metrics.heartRate?.map(r => r.amount) || [];
      const speeds = metrics.speed?.map(r => r.amount) || [];
      const powers = metrics.power?.map(r => r.amount) || [];
      
      const avgHeartRate = heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : undefined;
      const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : undefined;
      const minHeartRate = heartRates.length > 0 ? Math.min(...heartRates) : undefined;
      
      const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : undefined;
      const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : undefined;
      
      const avgPower = powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : undefined;
      const maxPower = powers.length > 0 ? Math.max(...powers) : undefined;

      return {
        session,
        totalDistanceMeters: totalDistance,
        totalActiveCalories: totalCalories,
        totalDurationSeconds: session.duration,
        
        avgHeartRate,
        maxHeartRate,
        minHeartRate,
        
        avgSpeed,
        maxSpeed,
        avgPower,
        maxPower,
        
        heartRateRecords: metrics.heartRate,
        distanceRecords: metrics.distance,
        speedRecords: metrics.speed,
        powerRecords: metrics.power
      };
    } catch (error) {
      console.error('Error fetching composite workout:', error);
      return null;
    }
  };

  const getWorkoutStats = async (
    params: WorkoutQueryParams & { 
      groupBy?: 'day' | 'week' | 'month' | 'year';
      includeAvg?: boolean;
      includeMax?: boolean;
      includeTotal?: boolean;
    }
  ): Promise<WorkoutStatsResult> => {
    try {
      const sessionResult = await getWorkoutSessions(params);
      const sessions = sessionResult.sessions;

      if (sessions.length === 0) {
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
      }

      // Calculate totals
      const totalWorkouts = sessions.length;
      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
      const avgDuration = totalDuration / totalWorkouts;

      // Group by exercise type
      const byExerciseType: Record<string, any> = {};
      sessions.forEach(session => {
        const type = session.exerciseType || 'OTHER';
        if (!byExerciseType[type]) {
          byExerciseType[type] = {
            count: 0,
            totalDuration: 0,
            avgDuration: 0
          };
        }
        byExerciseType[type].count++;
        byExerciseType[type].totalDuration += session.duration;
      });

      // Calculate averages for each type
      Object.keys(byExerciseType).forEach(type => {
        byExerciseType[type].avgDuration = byExerciseType[type].totalDuration / byExerciseType[type].count;
      });

      return {
        period: {
          startDate: params.startDate?.toISOString() || '',
          endDate: params.endDate?.toISOString() || '',
          groupBy: params.groupBy || 'day'
        },
        buckets: [], // TODO: Implement bucketing by time period
        totals: {
          totalWorkouts,
          totalDuration,
          totalDistance: 0, // TODO: Calculate from metrics
          totalCalories: 0, // TODO: Calculate from metrics
          avgDuration
        },
        byExerciseType
      };
    } catch (error) {
      console.error('Error fetching workout stats:', error);
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
    }
  };

  const getWorkoutSummariesByType = async (
    params: WorkoutQueryParams
  ): Promise<Record<WorkoutExerciseType, any>> => {
    try {
      const stats = await getWorkoutStats(params);
      return stats.byExerciseType as Record<WorkoutExerciseType, any>;
    } catch (error) {
      console.error('Error fetching workout summaries by type:', error);
      return {} as Record<WorkoutExerciseType, any>;
    }
  };

  const getPlatformWorkoutData = async <T = any>(
    workoutId: string,
    params?: Record<string, any>
  ): Promise<T | null> => {
    try {
      if (!isAvailable) {
        return null;
      }

      // Get the raw Health Connect ExerciseSessionRecord
      const recordType = 'ExerciseSession';
      
      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        endTime: new Date().toISOString(),
      };

      const readOptions = {
        timeRangeFilter,
        pageSize: 1000,
      };

      const result = await readRecords(recordType, readOptions);
      
      // Handle different possible response structures
      const records = result?.records || result || [];
      
      if (!Array.isArray(records)) {
        console.warn('Expected array of records, got:', typeof records, records);
        return null;
      }
      
      // Find the specific workout by matching the ID pattern
      const record = records.find((r: any) => 
        r.recordId === workoutId || 
        `${r.startTime}-${r.endTime}-exercise` === workoutId
      );

      return record as T || null;
    } catch (error) {
      console.error('Error fetching platform workout data:', error);
      return null;
    }
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
    
    // Workout methods (full Health Connect implementation)
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
const mapToHealthConnectRecordType = (dataType: string): string => {
  const mapping: Record<string, string> = {
    'steps': 'Steps',
    'stepCount': 'Steps',
    'distance': 'Distance',
    'calories': 'TotalCaloriesBurned',
    'activeCalories': 'ActiveCaloriesBurned',
    'walkingSpeed': 'Speed',
    'runningSpeed': 'Speed',
    'speed': 'Speed',
    'heartRate': 'HeartRate',
    'exerciseSession': 'ExerciseSession',
    'workoutSession': 'ExerciseSession',
    'power': 'Power',
  };
  
  return mapping[dataType] || 'Steps';
};

// Helper function to map generic data types to Health Connect permissions  
const mapToHealthConnectPermission = (dataType: string) => {
  const mapping: Record<string, { accessType: 'read'; recordType: any }> = {
    'steps': { accessType: 'read' as const, recordType: 'Steps' as const },
    'distance': { accessType: 'read' as const, recordType: 'Distance' as const },
    'calories': { accessType: 'read' as const, recordType: 'TotalCaloriesBurned' as const },
    'activeCalories': { accessType: 'read' as const, recordType: 'ActiveCaloriesBurned' as const },
    'walkingSpeed': { accessType: 'read' as const, recordType: 'Speed' as const },
    'runningSpeed': { accessType: 'read' as const, recordType: 'Speed' as const },
    'speed': { accessType: 'read' as const, recordType: 'Speed' as const },
    'heartRate': { accessType: 'read' as const, recordType: 'HeartRate' as const },
    'exerciseSession': { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
    'workoutSession': { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
    'power': { accessType: 'read' as const, recordType: 'Power' as const },
  };
  
  return mapping[dataType] || { accessType: 'read' as const, recordType: 'Steps' as const };
};