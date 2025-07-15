import { useState, useEffect } from 'react';
import { 
  initialize, 
  requestPermission, 
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import type { ReadRecordsOptions } from 'react-native-health-connect';
import type { 
  HealthServiceHook, 
  HealthDataAdapter, 
  QueryParams
} from '../../core/types';
import { AuthorizationRequestStatus } from '../../core/types';
import { 
  convertRecord, 
  mapToHealthConnectRecordType, 
  mapToHealthConnectPermission 
} from './mappers';
import { HEALTH_CONNECT_BASIC_PERMISSIONS } from './types';

export const useHealthService = (): HealthServiceHook => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthorizationRequestStatus>(
    AuthorizationRequestStatus.unknown
  );

  useEffect(() => {
    const initHealthConnect = async () => {
      try {
        const isInitialized = await initialize();
        const sdkStatus = await getSdkStatus();
        setIsAvailable(isInitialized && sdkStatus === SdkAvailabilityStatus.SDK_AVAILABLE);
      } catch (error) {
        console.error('Failed to initialize Health Connect:', error);
        setIsAvailable(false);
      }
    };

    initHealthConnect();
  }, []);

  const requestAuth = async (dataTypes?: string[]): Promise<AuthorizationRequestStatus> => {
    try {
      if (!isAvailable) {
        return AuthorizationRequestStatus.unknown;
      }

      // Use provided data types or default permissions
      const permissions = dataTypes 
        ? dataTypes.map(mapToHealthConnectPermission)
        : [...HEALTH_CONNECT_BASIC_PERMISSIONS];
        
      const result = await requestPermission(permissions);
      const status = result ? AuthorizationRequestStatus.unnecessary : AuthorizationRequestStatus.shouldRequest;
      setAuthStatus(status);
      return status;
    } catch (error) {
      console.error('Error requesting Health Connect permissions:', error);
      return AuthorizationRequestStatus.unknown;
    }
  };

  const getHealthData = async (
    dataType: string,
    params: QueryParams
  ): Promise<HealthDataAdapter[]> => {
    try {
      if (!isAvailable) {
        return [];
      }

      const recordType = mapToHealthConnectRecordType(dataType);
      
      const timeRangeFilter = (params.startDate && params.endDate) ? {
        operator: 'between' as const,
        startTime: params.startDate.toISOString(),
        endTime: params.endDate.toISOString(),
      } : undefined;
      
      const options: ReadRecordsOptions = {
        timeRangeFilter,
        dataOriginFilter: params.android?.dataOriginFilter,
        pageSize: params.pageSize || 100,
        pageToken: params.android?.pageToken,
      };

      const records = await readRecords(recordType as any, options);
      return (records as any).map((record: any) => convertRecord(record, dataType));
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
      if (!isAvailable) {
        return [];
      }

      const recordType = mapToHealthConnectRecordType(dataType);
      
      const timeRangeFilter = (params.startDate && params.endDate) ? {
        operator: 'between' as const,
        startTime: params.startDate.toISOString(),
        endTime: params.endDate.toISOString(),
      } : undefined;
      
      const options: ReadRecordsOptions = {
        timeRangeFilter,
        dataOriginFilter: params.android?.dataOriginFilter,
        pageSize: params.pageSize || 100,
        pageToken: params.android?.pageToken,
      };

      const records = await readRecords(recordType as any, options);
      return (records as any) as T[];
    } catch (error) {
      console.error('Error fetching platform health data:', error);
      return [];
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
    getPlatformHealthData
  };
};