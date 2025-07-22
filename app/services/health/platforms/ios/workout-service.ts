import {
  isHealthDataAvailable,
  useHealthkitAuthorization,
  queryQuantitySamples,
  queryWorkoutSamples,
  queryQuantitySamplesWithAnchor,
  queryWorkoutSamplesWithAnchor
} from '@kingstinct/react-native-healthkit';
import type { 
  QuantitySample as HKQuantitySample, 
  QueryOptionsWithSortOrderAndUnit,
  QuantityTypeIdentifier,
  WorkoutQueryOptions,
  WorkoutSample
} from '@kingstinct/react-native-healthkit';
import type { 
  QueryParams,
  HealthDataAdapter
} from '../../types';
import type {
  WorkoutHealthService,
  WorkoutQueryParams,
  WorkoutQueryResult,
  WorkoutMetricQueryParams,
  CompositeWorkoutQueryResult
} from '../../workout/queries';
import type {
  WorkoutSessionAdapter,
  CompositeWorkoutAdapter
} from '../../workout/types';
import type {
  WorkoutMetricRecord,
  WorkoutMetricDataType
} from '../../types/workout';
import { AuthorizationRequestStatus } from '../../types';
import { convertSample, mapToHKDataType } from './mappers';
import { HEALTHKIT_BASIC_PERMISSIONS, HEALTHKIT_WORKOUT_PERMISSIONS } from './types';
import { healthKitSyncManager } from '../../../../../src/services/healthkit/HealthKitSyncManager';
import { anchorStore } from '../../../../../src/services/healthkit/AnchorStore';
import { healthDataCache } from '../../../../../src/services/healthkit/HealthDataCache';
import { 
  adaptHealthKitWorkout,
  buildCompositeWorkoutFromHealthKit, 
  HEALTHKIT_ACTIVITY_TYPE_MAP, 
  HEALTHKIT_EVENT_TYPE_MAP 
} from '../../workout/ios';
import { WorkoutExerciseType } from '../../workout/types';

// Helper function to map activity type to exercise type
const mapActivityTypeToExerciseType = (activityType: number, dataOrigin?: string): WorkoutExerciseType => {
  // First try mapping from activity type
  const mappedType = HEALTHKIT_ACTIVITY_TYPE_MAP[activityType];
  if (mappedType && mappedType !== WorkoutExerciseType.OTHER) {
    return mappedType;
  }
  
  // If activity type doesn't give us a good mapping, try to infer from data source
  if (dataOrigin) {
    if (dataOrigin.includes('strava')) {
      // Strava workouts - try to infer from bundle ID
      if (dataOrigin.includes('ride')) return WorkoutExerciseType.CYCLING;
      if (dataOrigin.includes('run')) return WorkoutExerciseType.RUNNING;
      if (dataOrigin.includes('swim')) return WorkoutExerciseType.SWIMMING;
      // Default for Strava
      return WorkoutExerciseType.CYCLING;
    }
    if (dataOrigin.includes('nike')) return WorkoutExerciseType.RUNNING;
    if (dataOrigin.includes('peloton')) return WorkoutExerciseType.CYCLING;
  }
  
  return WorkoutExerciseType.OTHER;
};

// Combine basic and workout permissions
const ALL_PERMISSIONS = [...HEALTHKIT_BASIC_PERMISSIONS, ...HEALTHKIT_WORKOUT_PERMISSIONS];

export const useWorkoutHealthService = (): WorkoutHealthService => {
  const isAvailable = isHealthDataAvailable();
  
  const [authStatus, requestAuth] = useHealthkitAuthorization(
    ALL_PERMISSIONS, // Read permissions including workouts
    [] // Write permissions (none needed)
  );

  // Basic health data methods (from original service)
  const getHealthData = async (
    dataType: string,
    params: QueryParams
  ): Promise<HealthDataAdapter[]> => {
    try {
      const hkDataType = mapToHKDataType(dataType) as QuantityTypeIdentifier;
      
      // Check if we should use anchored query
      const hasAnchor = await anchorStore.getAnchor(hkDataType);
      const isDateRangeQuery = params.startDate && params.endDate;
      const useAnchoredQuery = hasAnchor !== null && !isDateRangeQuery && params.useAnchored !== false;
      
      if (useAnchoredQuery) {
        console.log(`🔄 [WORKOUT SERVICE] Using CACHED/ANCHORED query for ${dataType} (anchor exists: ${hasAnchor !== null})`);
        
        // Use cached data with sync - returns immediately if cached data exists
        const samples = await healthKitSyncManager.getCachedDataWithSync(hkDataType, {
          unit: params.ios?.unit,
          limit: params.pageSize || 100,
          startDate: params.startDate,
          endDate: params.endDate,
        }, 30000); // 30 second cache max age for frequent requests
        
        // Convert samples to adapter format
        const convertedSamples = samples.map(sample => 
          convertSample(sample, dataType)
        );
        
        return convertedSamples;
      } else {
        console.log(`📊 [WORKOUT SERVICE] Using REGULAR query for ${dataType} (${isDateRangeQuery ? 'date range query' : 'initial sync'})`);
        // Use regular query for date ranges or initial setup
        const queryOptions: QueryOptionsWithSortOrderAndUnit = {
          limit: params.pageSize || 100,
          ascending: params.ios?.ascending ?? false,
          unit: params.ios?.unit,
          filter: params.ios?.filter || (params.startDate && params.endDate ? {
            startDate: params.startDate,
            endDate: params.endDate
          } : undefined)
        };

        const samples = await queryQuantitySamples(hkDataType, queryOptions);
        
        // Only cache and set up anchors for non-date-range queries
        if (!isDateRangeQuery) {
          // Cache the initial data
          await healthDataCache.setCachedData(hkDataType, [...samples], {
            startDate: params.startDate,
            endDate: params.endDate,
            limit: params.pageSize || 100,
          });
          
          // After initial query, set up anchor for future syncs
          if (params.setupAnchor !== false) {
            try {
              const anchorResponse = await queryQuantitySamplesWithAnchor(hkDataType, {
                limit: 1,
                unit: params.ios?.unit,
              });
              await anchorStore.setAnchor(hkDataType, anchorResponse.newAnchor);
              console.log(`⚓ [WORKOUT SERVICE] Anchor set for ${dataType}`);
            } catch (error) {
              console.warn('Failed to setup anchor for', dataType, error);
            }
          }
        }
        
        return samples.map(sample => convertSample(sample, dataType));
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
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
        try {
          results[dataType] = await getHealthData(dataType, params);
        } catch (error) {
          console.error(`Error fetching ${dataType}:`, error);
          results[dataType] = [];
        }
      })
    );
    
    return results;
  };

  const getPlatformHealthData = async (
    dataType: string,
    params: QueryParams  
  ): Promise<HKQuantitySample[]> => {
    try {
      const hkDataType = mapToHKDataType(dataType) as QuantityTypeIdentifier;
      
      // Check if we should use anchored query
      const hasAnchor = await anchorStore.getAnchor(hkDataType);
      const isDateRangeQuery = params.startDate && params.endDate;
      
      if (hasAnchor && !isDateRangeQuery && params.useAnchored !== false) {
        console.log(`🔄 [WORKOUT SERVICE] Using ANCHORED platform query for ${dataType}`);
        const syncResult = await healthKitSyncManager.syncQuantityData(hkDataType, {
          unit: params.ios?.unit,
          limit: params.pageSize || 100,
          startDate: params.startDate,
          endDate: params.endDate,
        });
        
        return [...syncResult.newSamples]; // Return mutable copy
      } else {
        console.log(`📊 [WORKOUT SERVICE] Using REGULAR platform query for ${dataType} (${isDateRangeQuery ? 'date range query' : 'no anchor'})`);
        const queryOptions: QueryOptionsWithSortOrderAndUnit = {
          limit: params.pageSize || 100,
          ascending: params.ios?.ascending ?? false,
          unit: params.ios?.unit,
          filter: params.ios?.filter || (params.startDate && params.endDate ? {
            startDate: params.startDate,
            endDate: params.endDate
          } : undefined)
        };

        const samples = await queryQuantitySamples(hkDataType, queryOptions);
        return [...samples]; // Convert readonly array to mutable
      }
    } catch (error) {
      console.error('Error fetching platform health data:', error);
      return [];
    }
  };

  // Workout-specific methods
  const getWorkoutSessions = async (params: WorkoutQueryParams): Promise<WorkoutQueryResult> => {
    try {
      const queryOptions: WorkoutQueryOptions = {
        limit: params.pageSize || 100,
        ascending: params.ios?.ascending ?? false,
        filter: params.ios?.filter || (params.startDate && params.endDate ? {
          startDate: params.startDate,
          endDate: params.endDate
        } : undefined)
      };

      const workouts = await queryWorkoutSamples(queryOptions);
      
      // Debug: Log raw workout data to understand structure
      console.log('Raw workout data:', JSON.stringify(workouts[0], null, 2));
      
      // Convert HealthKit workouts to unified format using the proper adapter
      const sessions = workouts.map((workout: WorkoutSample, index) => {
        // Convert WorkoutProxy to RawWorkout format for the adapter
        const rawWorkout = {
          id: workout.uuid || `workout-${Date.now()}-${index}`,
          activityType: workout.workoutActivityType || 3000,
          startDate: workout.startDate.toISOString(),
          endDate: workout.endDate.toISOString(),
          duration: workout.duration.quantity || 0,
          totalEnergyBurned: workout.totalEnergyBurned?.quantity,
          totalDistance: workout.totalDistance?.quantity,
          totalSwimmingStrokeCount: workout.totalSwimmingStrokeCount?.quantity,
          totalFlightsClimbed: workout.totalFlightsClimbed?.quantity,
          workoutEvents: workout.events ? workout.events.map(event => ({
            type: event.type,
            date: event.startDate.toISOString(),
            duration: (event.endDate.getTime() - event.startDate.getTime()) / 1000, // duration in seconds
            metadata: undefined
          })) : undefined,
          route: undefined, // Route data needs separate query
          device: workout.device ? {
            name: workout.device.name ?? undefined,
            manufacturer: workout.device.manufacturer ?? undefined,
            model: workout.device.model ?? undefined,
            hardwareVersion: workout.device.hardwareVersion ?? undefined,
            firmwareVersion: workout.device.firmwareVersion ?? undefined,
            softwareVersion: workout.device.softwareVersion ?? undefined,
            localIdentifier: workout.device.localIdentifier ?? undefined,
            udiDeviceIdentifier: workout.device.udiDeviceIdentifier ?? undefined
          } : undefined,
          metadata: workout.metadata,
          sourceRevision: workout.sourceRevision ? {
            source: {
              name: workout.sourceRevision.source?.name || '',
              bundleIdentifier: workout.sourceRevision.source?.bundleIdentifier || ''
            },
            version: workout.sourceRevision.version ?? undefined,
            productType: workout.sourceRevision.productType ?? undefined,
            operatingSystemVersion: undefined // HealthKit string doesn't match our object structure
          } : undefined
        };
        
        // Use the dedicated adapter function
        return adaptHealthKitWorkout(rawWorkout);
      });
      
      // Filter by exercise types if specified
      let filteredSessions = sessions;
      if (params.exerciseTypes && params.exerciseTypes.length > 0) {
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

      return {
        sessions: filteredSessions,
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
      const result = await getWorkoutSessions({
        ...params,
        pageSize: 100
      });
      
      return result.sessions.find(session => session.uuid === workoutId) || null;
    } catch (error) {
      console.error('Error fetching workout session:', error);
      return null;
    }
  };

  const getWorkoutMetrics = async (
    params: WorkoutMetricQueryParams
  ): Promise<Record<WorkoutMetricDataType, WorkoutMetricRecord[]>> => {
    // Implementation would fetch associated metrics for workouts
    // For now, return empty records
    const result = {} as Record<WorkoutMetricDataType, WorkoutMetricRecord[]>;
    params.metricTypes.forEach((type: WorkoutMetricDataType) => {
      result[type] = [];
    });
    return result;
  };

  const getCompositeWorkouts = async (
    params: WorkoutQueryParams
  ): Promise<CompositeWorkoutQueryResult> => {
    try {
      const workoutResult = await getWorkoutSessions(params);
      
      // For each workout, fetch associated metrics if requested
      const compositeWorkouts = await Promise.all(
        workoutResult.sessions.map(async (session: WorkoutSessionAdapter) => {
          // Here you would fetch associated metrics
          // For now, return basic composite workout
          return buildCompositeWorkoutFromHealthKit(session, {});
        })
      );

      return {
        workouts: compositeWorkouts,
        metadata: {
          queryTime: Date.now(),
          platform: 'ios',
          metricsIncluded: params.metricTypes || []
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
    const session = await getWorkoutSession(workoutId, params);
    if (!session) return null;
    
    return buildCompositeWorkoutFromHealthKit(session, {});
  };

  const getWorkoutStats = async (params: any): Promise<any> => {
    // Placeholder implementation
    return {
      period: {
        startDate: params.startDate?.toISOString() || '',
        endDate: params.endDate?.toISOString() || '',
        groupBy: params.groupBy || 'day'
      },
      buckets: [],
      totals: {
        totalWorkouts: 0,
        totalDuration: 0
      },
      byExerciseType: {}
    };
  };

  const getWorkoutSummariesByType = async (
    params: WorkoutQueryParams
  ): Promise<Record<WorkoutExerciseType, any>> => {
    // Placeholder implementation
    return {} as any;
  };

  return {
    // Basic health service properties
    isAvailable,
    platform: 'ios',
    authStatus: authStatus || AuthorizationRequestStatus.unknown,
    requestAuth: async (dataTypes?: string[]) => {
      await requestAuth();
      return authStatus || AuthorizationRequestStatus.unknown;
    },
    AuthorizationRequestStatus,
    
    // Basic health data methods
    getHealthData,
    getBatchData,
    getPlatformHealthData: getPlatformHealthData as <T = any>(dataType: string, params: QueryParams) => Promise<T[]>,
    
    // Workout-specific methods
    getWorkoutSessions,
    getWorkoutSession,
    getWorkoutMetrics,
    getCompositeWorkouts,
    getCompositeWorkout,
    getWorkoutStats,
    getWorkoutSummariesByType
  };
};