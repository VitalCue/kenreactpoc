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
} from '../../types';
import { AuthorizationRequestStatus } from '../../types';
import { 
  convertRecord, 
  mapToHealthConnectRecordType
} from './mappers';


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
      const defaultPermissions = [
        // Basic health data
        { accessType: 'read' as const, recordType: 'Steps' as const },
        { accessType: 'read' as const, recordType: 'Distance' as const },
        { accessType: 'read' as const, recordType: 'TotalCaloriesBurned' as const },
        { accessType: 'read' as const, recordType: 'ActiveCaloriesBurned' as const },
        { accessType: 'read' as const, recordType: 'HeartRate' as const },
        
        // Speed data (for walkingSpeed/runningSpeed)
        { accessType: 'read' as const, recordType: 'Speed' as const },
        
        // Exercise data
        { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
        
        // Advanced metrics
        { accessType: 'read' as const, recordType: 'Power' as const },
      ];
      
      const permissions = dataTypes 
        ? dataTypes.map(dataType => {
            // Simple mapping for now
            const mapping: Record<string, any> = {
              'steps': { accessType: 'read' as const, recordType: 'Steps' as const },
              'stepCount': { accessType: 'read' as const, recordType: 'Steps' as const },
              'distance': { accessType: 'read' as const, recordType: 'Distance' as const },
              'calories': { accessType: 'read' as const, recordType: 'ActiveCaloriesBurned' as const },
              'activeCalories': { accessType: 'read' as const, recordType: 'ActiveCaloriesBurned' as const },
              'heartRate': { accessType: 'read' as const, recordType: 'HeartRate' as const },
              'speed': { accessType: 'read' as const, recordType: 'Speed' as const },
              'walkingSpeed': { accessType: 'read' as const, recordType: 'Speed' as const },
              'runningSpeed': { accessType: 'read' as const, recordType: 'Speed' as const },
              'exerciseSession': { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
              'workoutSession': { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
              'power': { accessType: 'read' as const, recordType: 'Power' as const },
            };
            return mapping[dataType] || { accessType: 'read' as const, recordType: 'Steps' as const };
          })
        : defaultPermissions;
        
      console.log('Requesting permissions:', permissions);
      const result = await requestPermission(permissions);
      console.log('Permission result:', result);
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
      console.log(`Querying ${dataType} -> ${recordType} from ${params.startDate} to ${params.endDate}`);
      
      if (!params.startDate || !params.endDate) {
        throw new Error('startDate and endDate are required for Android Health Connect');
      }

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: params.startDate.toISOString(),
        endTime: params.endDate.toISOString(),
      };
      
      const options: ReadRecordsOptions = {
        timeRangeFilter,
        dataOriginFilter: params.android?.dataOriginFilter,
        pageSize: params.pageSize || 100,
        pageToken: params.android?.pageToken,
      };

      const result = await readRecords(recordType as any, options);
      console.log('Raw Health Connect result:', result);
      
      // Handle different possible response structures
      const records = result?.records || result || [];
      
      if (!Array.isArray(records)) {
        console.warn('Expected array of records, got:', typeof records, records);
        return [];
      }
      
      return records.map((record: any) => convertRecord(record, dataType));
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
      
      if (!params.startDate || !params.endDate) {
        throw new Error('startDate and endDate are required for Android Health Connect');
      }

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: params.startDate.toISOString(),
        endTime: params.endDate.toISOString(),
      };
      
      const options: ReadRecordsOptions = {
        timeRangeFilter,
        dataOriginFilter: params.android?.dataOriginFilter,
        pageSize: params.pageSize || 100,
        pageToken: params.android?.pageToken,
      };

      const result = await readRecords(recordType as any, options);
      
      // Handle different possible response structures
      const records = result?.records || result || [];
      
      if (!Array.isArray(records)) {
        console.warn('Expected array of records, got:', typeof records, records);
        return [];
      }

      return records as T[];
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
    getPlatformHealthData,
  };
};