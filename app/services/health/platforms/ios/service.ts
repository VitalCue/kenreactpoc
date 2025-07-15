import {
  isHealthDataAvailable,
  useHealthkitAuthorization,
  queryQuantitySamples
} from '@kingstinct/react-native-healthkit';
import type { 
  QuantitySample as HKQuantitySample, 
  QueryOptionsWithSortOrderAndUnit,
  QuantityTypeIdentifier
} from '@kingstinct/react-native-healthkit';
import type { 
  HealthServiceHook, 
  HealthDataAdapter, 
  QueryParams
} from '../../core/types';
import { AuthorizationRequestStatus } from '../../core/types';
import { convertSample, mapToHKDataType } from './mappers';
import { HEALTHKIT_BASIC_PERMISSIONS } from './types';

export const useHealthService = (): HealthServiceHook => {
  const isAvailable = isHealthDataAvailable();
  
  const [authStatus, requestAuth] = useHealthkitAuthorization(
    HEALTHKIT_BASIC_PERMISSIONS, // Read permissions
    [] // Write permissions (none needed for basic health data)
  );

  const getHealthData = async (
    dataType: string,
    params: QueryParams
  ): Promise<HealthDataAdapter[]> => {
    try {
      // Map to HealthKit data type
      const hkDataType = mapToHKDataType(dataType) as QuantityTypeIdentifier;
      
      // Build iOS-specific query options
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
      return samples.map(sample => convertSample(sample, dataType));
    } catch (error) {
      console.error('Error fetching health data:', error);
      return [];
    }
  };

  const getBatchData = async (
    dataTypes: string[],
    params: QueryParams
  ): Promise<Record<string, HealthDataAdapter[]>> => {
    try {
      const results = await Promise.all(
        dataTypes.map(async (dataType) => {
          const data = await getHealthData(dataType, params);
          return { dataType, data };
        })
      );

      return results.reduce((acc, { dataType, data }) => {
        acc[dataType] = data;
        return acc;
      }, {} as Record<string, HealthDataAdapter[]>);
    } catch (error) {
      console.error('Error fetching batch health data:', error);
      return {};
    }
  };

  const getPlatformHealthData = async <T = any>(
    dataType: string,
    params: QueryParams
  ): Promise<T[]> => {
    try {
      const hkDataType = mapToHKDataType(dataType) as QuantityTypeIdentifier;
      
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
      return samples as unknown as T[];
    } catch (error) {
      console.error('Error fetching platform health data:', error);
      return [];
    }
  };

  return {
    isAvailable,
    platform: 'ios',
    authStatus: authStatus || AuthorizationRequestStatus.unknown,
    requestAuth,
    AuthorizationRequestStatus,
    getHealthData,
    getBatchData,
    getPlatformHealthData
  };
};