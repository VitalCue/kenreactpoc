// services/HealthService.ios.ts
import {
  isHealthDataAvailable,
  useHealthkitAuthorization,
  queryQuantitySamples,
  AuthorizationRequestStatus as HKAuthorizationRequestStatus,
} from '@kingstinct/react-native-healthkit';
import type { QuantitySample as HKQuantitySample, QueryOptionsWithSortOrderAndUnit } from '@kingstinct/react-native-healthkit';
import { 
  HealthServiceHook, 
  HealthDataAdapter, 
  QueryParams, 
  AuthorizationRequestStatus,
  IOSHealthData,
  PlatformSpecificData, 
  PredicateWithStartAndEnd
} from './HealthServices.types';

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

export const useHealthService = (): HealthServiceHook => {
  const isAvailable = isHealthDataAvailable();
  
  const [authStatus, requestAuth] = useHealthkitAuthorization(
    [
      'HKQuantityTypeIdentifierStepCount',
      'HKQuantityTypeIdentifierDistanceWalkingRunning',
      'HKQuantityTypeIdentifierActiveEnergyBurned',
      'HKQuantityTypeIdentifierWalkingSpeed',
      'HKQuantityTypeIdentifierRunningSpeed'
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
    'heartRate': 'HKQuantityTypeIdentifierHeartRate',
  };
  
  return mapping[dataType] || dataType;
};