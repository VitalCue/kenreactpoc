// services/HealthService.ios.ts
import {
  isHealthDataAvailable,
  useHealthkitAuthorization,
  queryQuantitySamples,
  queryWorkoutSamples,
} from '@kingstinct/react-native-healthkit';
import type { 
  QuantitySample as HKQuantitySample, 
  QueryOptionsWithSortOrderAndUnit,
  WorkoutQueryOptions
} from '@kingstinct/react-native-healthkit';
import { 
  HealthDataAdapter, 
  QueryParams, 
  AuthorizationRequestStatus,
  IOSHealthData,
  PlatformSpecificData, 
  PredicateWithStartAndEnd,
  WorkoutMetricRecord,
  WorkoutMetricDataType,
  convertHKDeviceToIOSDevice,
  convertHKSourceRevisionToIOSSourceRevision,
  convertWorkoutSampleToRaw,
  mapMetricTypeToHealthKit
} from './types';

// Import workout-specific types and adapters
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
  WorkoutExerciseType
} from './workout/types';
import {
  adaptHealthKitWorkout,
  buildCompositeWorkoutFromHealthKit,
  validateHealthKitWorkout,
  filterMetricsByWorkoutTime
} from './workout/ios';

// Helper function to convert HK sample to our unified format 
const convertSample = (sample: HKQuantitySample, dataType: string): HealthDataAdapter => {
  const platformData: PlatformSpecificData = {
    platform: 'ios',
    data: {
      device: sample.device,
      quantityType: sample.quantityType,
      metadata: sample.metadata,
      sourceRevision: sample.sourceRevision,
      sampleType: dataType,
    } as IOSHealthData
  };

  return {
    uuid: sample.uuid,
    deviceManf: sample.device?.manufacturer || 'Unknown',
    deviceModel: sample.device?.model || 'Unknown',
    dataType: sample.quantityType,
    startDate: sample.startDate.toISOString(),
    endDate: sample.endDate.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    amount: sample.quantity,
    unit: sample.unit,
    dataOrigin: sample.sourceRevision?.source?.bundleIdentifier || 'Unknown',
    platformData,
  };
};

export const useHealthService = (): WorkoutHealthService => {
  const isAvailable = isHealthDataAvailable();
  
  const [authStatus, requestAuth] = useHealthkitAuthorization(
    [
      'HKQuantityTypeIdentifierStepCount',
      'HKQuantityTypeIdentifierDistanceWalkingRunning',
      'HKQuantityTypeIdentifierActiveEnergyBurned',
      'HKQuantityTypeIdentifierWalkingSpeed',
      'HKQuantityTypeIdentifierRunningSpeed',
      'HKWorkoutTypeIdentifier',                 
      'HKQuantityTypeIdentifierHeartRate',      
      'HKQuantityTypeIdentifierFlightsClimbed', 
      'HKQuantityTypeIdentifierSwimmingStrokeCount',
      'HKQuantityTypeIdentifierAppleExerciseTime'
    ], //all reads
    [] //all writes (none needed)
  );

  const getHealthData = async (
    dataType: string,
    params: QueryParams
  ): Promise<HealthDataAdapter[]> => {
    try {
      const hkDataType = mapToHKDataType(dataType) as any;
      
      // Build query options
      let queryOptions: QueryOptionsWithSortOrderAndUnit = {};
      
      // Handle iOS-specific options
      if (params.ios) {
        queryOptions = {
          ...queryOptions,
          ...(params.ios.filter && { filter: params.ios.filter }),
          ...(params.ios.unit && { unit: params.ios.unit }),
          ...(params.ios.ascending !== undefined && { ascending: params.ios.ascending }),
          ...(params.ios.limit && { limit: params.ios.limit }),
        };
      }

      // Fall back to date filter if no iOS filter specified
      if (!queryOptions.filter && (params.startDate || params.endDate)) {
        const dateFilter: PredicateWithStartAndEnd = {
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
        };
        queryOptions = { ...queryOptions, filter: dateFilter };
      }

      // Apply pageSize as limit if no iOS limit specified
      if (!queryOptions.limit && params.pageSize) {
        queryOptions = { ...queryOptions, limit: params.pageSize };
      }

      // Actually query the samples
      const samples = await queryQuantitySamples(hkDataType, queryOptions);
      
      return samples.map(sample => convertSample(sample, dataType));
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

  const getPlatformHealthData = async <T = HKQuantitySample>(
    dataType: string,
    params: QueryParams
  ): Promise<T[]> => {
    try {
      const hkDataType = mapToHKDataType(dataType) as any;
      
      // Build query options with proper filter structure
      let queryOptions: QueryOptionsWithSortOrderAndUnit = {
        ...(params.ios || {}),
        ...(params.pageSize && !params.ios?.limit && { limit: params.pageSize }),
      };
      
      // Add date filter if not already present
      if (!queryOptions.filter && (params.startDate || params.endDate)) {
        const dateFilter: PredicateWithStartAndEnd = {
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
        };
        queryOptions = { ...queryOptions, filter: dateFilter };
      }
      
      const samples = await queryQuantitySamples(hkDataType, queryOptions);
      
      return samples as T[];
    } catch (error) {
      console.error(`Error fetching platform-specific ${dataType} data:`, error);
      return [];
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // WORKOUT-SPECIFIC METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  const getWorkoutSessions = async (params: WorkoutQueryParams): Promise<WorkoutQueryResult> => {
    try {
      // Build HealthKit workout query options
      let queryOptions: WorkoutQueryOptions = {
        limit: params.pageSize || 50,
        ...(params.ios || {}),
      };

      // Add date filter if not already present
      if (!queryOptions.filter && (params.startDate || params.endDate)) {
        const dateFilter: PredicateWithStartAndEnd = {
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
        };
        queryOptions = { ...queryOptions, filter: dateFilter };
      }

      // Query workouts from HealthKit
      const workoutSamples = await queryWorkoutSamples(queryOptions);
      
      // Convert to unified format and validate
      const sessions: WorkoutSessionAdapter[] = workoutSamples
        .filter(workout => validateHealthKitWorkout(convertWorkoutSampleToRaw(workout)))
        .map(workout => adaptHealthKitWorkout(convertWorkoutSampleToRaw(workout)));

      // Filter by exercise types if specified
      let filteredSessions = sessions;
      if (params.exerciseTypes?.length) {
        filteredSessions = sessions.filter(session => 
          params.exerciseTypes!.includes(session.exerciseType)
        );
      }

      // Filter by duration if specified
      if (params.minDuration !== undefined) {
        filteredSessions = filteredSessions.filter(session => 
          session.duration >= params.minDuration!
        );
      }
      if (params.maxDuration !== undefined) {
        filteredSessions = filteredSessions.filter(session => 
          session.duration <= params.maxDuration!
        );
      }

      // Filter by data origins if specified
      if (params.dataOrigins?.length) {
        filteredSessions = filteredSessions.filter(session => 
          params.dataOrigins!.includes(session.dataOrigin)
        );
      }

      return {
        sessions: filteredSessions,
        pagination: {
          hasMore: filteredSessions.length === (params.pageSize || 50),
          total: filteredSessions.length
        },
        metadata: {
          queryTime: Date.now(),
          platform: 'ios',
          dataTypes: ['workoutSession']
        }
      };
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
      return {
        sessions: [],
        metadata: {
          queryTime: Date.now(),
          platform: 'ios',
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
      const queryOptions: WorkoutQueryOptions = {
        filter: { uuid: workoutId },
        limit: 1,
        ...(params?.ios || {})
      };

      const workoutSamples = await queryWorkoutSamples(queryOptions);
      
      if (workoutSamples.length === 0) {
        return null;
      }

      const workout = workoutSamples[0];
      const rawWorkout = convertWorkoutSampleToRaw(workout);
      if (!validateHealthKitWorkout(rawWorkout)) {
        return null;
      }

      return adaptHealthKitWorkout(rawWorkout);
    } catch (error) {
      console.error(`Error fetching workout session ${workoutId}:`, error);
      return null;
    }
  };

  const getWorkoutMetrics = async (
    params: WorkoutMetricQueryParams
  ): Promise<Record<WorkoutMetricDataType, WorkoutMetricRecord[]>> => {
    try {
      const results: Record<WorkoutMetricDataType, WorkoutMetricRecord[]> = {} as any;
      
      // Build base query options
      let queryOptions: QueryOptionsWithSortOrderAndUnit = {
        limit: params.pageSize || 1000,
        ...(params.ios || {}),
      };

      // Add date filter if not already present
      if (!queryOptions.filter && (params.startDate || params.endDate)) {
        const dateFilter: PredicateWithStartAndEnd = {
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
        };
        queryOptions = { ...queryOptions, filter: dateFilter };
      }

      // Query each metric type
      for (const metricType of params.metricTypes) {
        const hkDataType = mapMetricTypeToHealthKit(metricType);
        if (hkDataType) {
          try {
            const samples = await queryQuantitySamples(hkDataType as any, queryOptions);
            const mappedSamples = samples.map(sample => {
              const baseRecord = {
                uuid: sample.uuid,
                deviceManf: sample.device?.manufacturer || 'Apple',
                deviceModel: sample.device?.model || 'iPhone',
                startDate: sample.startDate.toISOString(),
                endDate: sample.endDate.toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                amount: sample.quantity,
                dataOrigin: sample.sourceRevision?.source?.bundleIdentifier || 'com.apple.health',
                platformData: {
                  platform: 'ios' as const,
                  data: {
                    device: convertHKDeviceToIOSDevice(sample.device as any),
                    sourceRevision: convertHKSourceRevisionToIOSSourceRevision(sample.sourceRevision as any),
                    metadata: sample.metadata,
                    quantityType: hkDataType,
                    sampleType: hkDataType
                  }
                }
              };

              // Return properly typed metric based on type
              switch (metricType) {
                case 'heartRate':
                  return { ...baseRecord, dataType: 'heartRate' as const, unit: 'bpm' } as const;
                case 'distance':
                  return { ...baseRecord, dataType: 'distance' as const, unit: 'm' } as const;
                case 'activeCalories':
                  return { ...baseRecord, dataType: 'activeCalories' as const, unit: 'kcal' } as const;
                case 'speed':
                  return { ...baseRecord, dataType: 'speed' as const, unit: 'm/s' } as const;
                case 'stepCount':
                  return { ...baseRecord, dataType: 'stepCount' as const, unit: 'count' } as const;
                case 'power':
                  return { ...baseRecord, dataType: 'power' as const, unit: 'W' } as const;
                case 'cadence':
                  return { ...baseRecord, dataType: 'cadence' as const, unit: 'rpm' } as const;
                default:
                  return { ...baseRecord, dataType: metricType as any, unit: sample.unit };
              }
            });
            
            results[metricType as WorkoutMetricDataType] = mappedSamples as WorkoutMetricRecord[];

            // Filter by workout if specified
            if (params.workoutId && results[metricType as WorkoutMetricDataType]) {
              const workout = await getWorkoutSession(params.workoutId);
              if (workout) {
                results[metricType as WorkoutMetricDataType] = filterMetricsByWorkoutTime(
                  results[metricType as WorkoutMetricDataType] as any,
                  workout.startDate,
                  workout.endDate
                ) as WorkoutMetricRecord[];
              }
            }
          } catch (error) {
            console.error(`Error fetching ${metricType} metrics:`, error);
            results[metricType as WorkoutMetricDataType] = [];
          }
        } else {
          results[metricType as WorkoutMetricDataType] = [];
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching workout metrics:', error);
      return {} as Record<WorkoutMetricDataType, WorkoutMetricRecord[]>;
    }
  };

  const getCompositeWorkouts = async (
    params: WorkoutQueryParams
  ): Promise<CompositeWorkoutQueryResult> => {
    try {
      // First get workout sessions
      const sessionResult = await getWorkoutSessions(params);
      
      if (sessionResult.sessions.length === 0) {
        return {
          workouts: [],
          metadata: {
            queryTime: Date.now(),
            platform: 'ios',
            metricsIncluded: []
          }
        };
      }

      // Determine which metrics to include
      const defaultMetrics: WorkoutMetricDataType[] = ['heartRate', 'distance', 'activeCalories'];
      const metricsToFetch = params.metricTypes || defaultMetrics;

      const compositeWorkouts: CompositeWorkoutAdapter[] = [];

      // For each workout session, fetch associated metrics
      for (const session of sessionResult.sessions) {
        if (params.includeMetrics !== false) {
          try {
            const metricsResult = await getWorkoutMetrics({
              workoutId: session.uuid,
              metricTypes: metricsToFetch,
              startDate: new Date(session.startDate),
              endDate: new Date(session.endDate),
              pageSize: 1000
            });

            const composite = buildCompositeWorkoutFromHealthKit(session, {
              heartRate: metricsResult.heartRate as any,
              distance: metricsResult.distance as any,
              activeCalories: metricsResult.activeCalories as any,
              speed: metricsResult.speed as any,
              stepCount: metricsResult.stepCount as any,
              power: metricsResult.power as any,
              cadence: metricsResult.cadence as any
            });

            compositeWorkouts.push(composite);
          } catch (error) {
            console.error(`Error building composite workout for ${session.uuid}:`, error);
            // Fallback: create composite with just the session
            compositeWorkouts.push({
              session,
              totalDurationSeconds: session.duration,
              totalDistanceMeters: session.totalDistance,
              totalActiveCalories: session.totalActiveCalories
            });
          }
        } else {
          // Just the session without metrics
          compositeWorkouts.push({
            session,
            totalDurationSeconds: session.duration,
            totalDistanceMeters: session.totalDistance,
            totalActiveCalories: session.totalActiveCalories
          });
        }
      }

      return {
        workouts: compositeWorkouts,
        pagination: sessionResult.pagination,
        metadata: {
          queryTime: Date.now(),
          platform: 'ios',
          metricsIncluded: params.includeMetrics !== false ? metricsToFetch : []
        }
      };
    } catch (error) {
      console.error('Error fetching composite workouts:', error);
      return {
        workouts: [],
        metadata: {
          queryTime: Date.now(),
          platform: 'ios',
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

      const defaultMetrics: WorkoutMetricDataType[] = ['heartRate', 'distance', 'activeCalories'];
      const metricsToFetch = params?.metricTypes || defaultMetrics;

      if (params?.includeMetrics !== false) {
        const metricsResult = await getWorkoutMetrics({
          workoutId: session.uuid,
          metricTypes: metricsToFetch,
          startDate: new Date(session.startDate),
          endDate: new Date(session.endDate),
          pageSize: 1000
        });

        return buildCompositeWorkoutFromHealthKit(session, {
          heartRate: metricsResult.heartRate as any,
          distance: metricsResult.distance as any,
          activeCalories: metricsResult.activeCalories as any,
          speed: metricsResult.speed as any,
          stepCount: metricsResult.stepCount as any,
          power: metricsResult.power as any,
          cadence: metricsResult.cadence as any
        });
      } else {
        return {
          session,
          totalDurationSeconds: session.duration,
          totalDistanceMeters: session.totalDistance,
          totalActiveCalories: session.totalActiveCalories
        };
      }
    } catch (error) {
      console.error(`Error fetching composite workout ${workoutId}:`, error);
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

      // Basic implementation - can be enhanced with more sophisticated aggregation
      const totals = {
        totalWorkouts: sessions.length,
        totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
        totalDistance: sessions.reduce((sum, s) => sum + (s.totalDistance || 0), 0),
        totalCalories: sessions.reduce((sum, s) => sum + (s.totalActiveCalories || 0), 0),
        avgDuration: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0
      };

      // Group by exercise type
      const byExerciseType: Record<WorkoutExerciseType, {
        count: number;
        totalDuration: number;
        totalDistance?: number;
        totalCalories?: number;
      }> = {} as any;
      
      sessions.forEach(session => {
        if (!byExerciseType[session.exerciseType]) {
          byExerciseType[session.exerciseType] = {
            count: 0,
            totalDuration: 0,
            totalDistance: 0,
            totalCalories: 0
          };
        }
        byExerciseType[session.exerciseType].count += 1;
        byExerciseType[session.exerciseType].totalDuration += session.duration;
        byExerciseType[session.exerciseType].totalDistance! += session.totalDistance || 0;
        byExerciseType[session.exerciseType].totalCalories! += session.totalActiveCalories || 0;
      });

      return {
        period: {
          startDate: params.startDate?.toISOString() || '',
          endDate: params.endDate?.toISOString() || '',
          groupBy: params.groupBy || 'day'
        },
        buckets: [], // Simplified - would need more complex implementation for time buckets
        totals,
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
      const sessionResult = await getWorkoutSessions(params);
      const sessions = sessionResult.sessions;

      const summaries: Record<string, any> = {};

      sessions.forEach(session => {
        if (!summaries[session.exerciseType]) {
          summaries[session.exerciseType] = {
            exerciseType: session.exerciseType,
            totalWorkouts: 0,
            totalDuration: 0,
            totalDistance: 0,
            totalCalories: 0,
            avgDuration: 0,
            avgDistance: 0,
            avgCalories: 0,
            bestDuration: 0,
            bestDistance: 0,
            bestCalories: 0,
            lastWorkout: '',
            workoutsThisWeek: 0,
            workoutsThisMonth: 0
          };
        }

        const summary = summaries[session.exerciseType];
        summary.totalWorkouts += 1;
        summary.totalDuration += session.duration;
        summary.totalDistance += session.totalDistance || 0;
        summary.totalCalories += session.totalActiveCalories || 0;

        // Update bests
        summary.bestDuration = Math.max(summary.bestDuration, session.duration);
        summary.bestDistance = Math.max(summary.bestDistance, session.totalDistance || 0);
        summary.bestCalories = Math.max(summary.bestCalories, session.totalActiveCalories || 0);

        // Update last workout
        if (!summary.lastWorkout || new Date(session.startDate) > new Date(summary.lastWorkout)) {
          summary.lastWorkout = session.startDate;
        }
      });

      // Calculate averages
      Object.values(summaries).forEach((summary: any) => {
        if (summary.totalWorkouts > 0) {
          summary.avgDuration = summary.totalDuration / summary.totalWorkouts;
          summary.avgDistance = summary.totalDistance / summary.totalWorkouts;
          summary.avgCalories = summary.totalCalories / summary.totalWorkouts;
        }
      });

      return summaries as Record<WorkoutExerciseType, any>;
    } catch (error) {
      console.error('Error fetching workout summaries by type:', error);
      return {} as Record<WorkoutExerciseType, any>;
    }
  };

  const getPlatformWorkoutData = async <T = any>(
    workoutId: string,
    _params?: Record<string, any>
  ): Promise<T | null> => {
    try {
      // Note: This is a placeholder implementation 
      console.warn(`iOS platform workout data not fully implemented for ${workoutId} - HealthKit queryWorkouts may not be available`);
      return null;
    } catch (error) {
      console.error(`Error fetching platform workout data ${workoutId}:`, error);
      return null;
    }
  };

  return {
    isAvailable,
    platform: 'ios',
    authStatus: authStatus ?? AuthorizationRequestStatus.unknown,
    requestAuth: async (_dataTypes?: string[]) => {
      // Note: The actual permissions were already configured when useHealthkitAuthorization was called
      // The dataTypes parameter is included for API compatibility but doesn't affect which permissions are requested
      // All permissions must be declared upfront in the useHealthkitAuthorization hook
      return requestAuth();
    },
    AuthorizationRequestStatus,
    getHealthData,
    getBatchData,
    getPlatformHealthData,
    
    // Workout-specific methods
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

// Helper function to map generic data types to HealthKit types
const mapToHKDataType = (dataType: string): string => {
  const mapping: Record<string, string> = {
    'steps': 'HKQuantityTypeIdentifierStepCount',
    'distance': 'HKQuantityTypeIdentifierDistanceWalkingRunning',
    'calories': 'HKQuantityTypeIdentifierActiveEnergyBurned',
    'walkingSpeed': 'HKQuantityTypeIdentifierWalkingSpeed',
    'runningSpeed': 'HKQuantityTypeIdentifierRunningSpeed',
    'heartRate': 'HKQuantityTypeIdentifierHeartRate',   // if you want HR samples
    'flightsClimbed': 'HKQuantityTypeIdentifierFlightsClimbed',  // stairs climbed
    'swimmingStrokeCount':  'HKQuantityTypeIdentifierSwimmingStrokeCount',
    'AppleExerciseTime': 'HKQuantityTypeIdentifierAppleExerciseTime'
  };
  
  return mapping[dataType] || dataType;
};

