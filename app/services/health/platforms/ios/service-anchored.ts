import {
  isHealthDataAvailable,
  useHealthkitAuthorization,
  queryQuantitySamples,
  queryQuantitySamplesWithAnchor,
  QuantityTypeIdentifier,
  QuantitySample as HKQuantitySample,
  QueryOptionsWithSortOrderAndUnit,
  QueryOptionsWithAnchorAndUnit,
} from '@kingstinct/react-native-healthkit';
import type { 
  HealthServiceHook, 
  HealthDataAdapter, 
  QueryParams
} from '../../types';
import { AuthorizationRequestStatus } from '../../types';
import { convertSample, mapToHKDataType } from './mappers';
import { HEALTHKIT_BASIC_PERMISSIONS } from './types';
import { healthKitSyncManager } from '../../../../../src/services/healthkit/HealthKitSyncManager';
import { anchorStore } from '../../../../../src/services/healthkit/AnchorStore';

export const useHealthServiceAnchored = (): HealthServiceHook => {
  const isAvailable = isHealthDataAvailable();
  
  const [authStatus, requestAuth] = useHealthkitAuthorization(
    HEALTHKIT_BASIC_PERMISSIONS,
    []
  );

  /**
   * Get health data using anchored queries for efficient syncing
   * This will only fetch new/changed data since last sync
   */
  const getHealthData = async (
    dataType: string,
    params: QueryParams
  ): Promise<HealthDataAdapter[]> => {
    try {
      const hkDataType = mapToHKDataType(dataType) as QuantityTypeIdentifier;
      
      // Check if we should use anchored query or regular query
      const hasAnchor = await anchorStore.getAnchor(hkDataType);
      const useAnchoredQuery = hasAnchor !== null || params.useAnchored !== false;
      
      if (useAnchoredQuery) {
        console.log(`🔄 Using ANCHORED query for ${dataType} (anchor exists: ${hasAnchor !== null})`);
        // Use anchored query for efficient sync
        const syncResult = await healthKitSyncManager.syncQuantityData(hkDataType, {
          unit: params.ios?.unit,
          limit: params.pageSize || 100,
          startDate: params.startDate,
          endDate: params.endDate,
        });
        
        // Convert new samples to adapter format
        const convertedSamples = syncResult.newSamples.map(sample => 
          convertSample(sample, dataType)
        );
        
        // Handle deleted samples if you have a local cache
        if (syncResult.deletedSampleIds.length > 0 && params.onDeletedSamples) {
          params.onDeletedSamples(syncResult.deletedSampleIds);
        }
        
        return convertedSamples;
      } else {
        console.log(`📊 Using REGULAR query for ${dataType} (initial sync)`);
        // Fall back to regular query for initial load or when explicitly requested
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
        
        // After initial query, set up anchor for future syncs
        // We'll need to do an anchored query to get the initial anchor
        if (params.setupAnchor !== false) {
          try {
            const anchorResponse = await queryQuantitySamplesWithAnchor(hkDataType, {
              limit: 1,
              unit: params.ios?.unit,
            });
            await anchorStore.setAnchor(hkDataType, anchorResponse.newAnchor);
          } catch (error) {
            console.warn('Failed to setup anchor for', dataType, error);
          }
        }
        
        return samples.map(sample => convertSample(sample, dataType));
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      return [];
    }
  };

  /**
   * Get batch data with anchored queries
   */
  const getBatchData = async (
    dataTypes: string[],
    params: QueryParams
  ): Promise<Record<string, HealthDataAdapter[]>> => {
    try {
      // For batch operations, we can sync multiple types in parallel
      const hkDataTypes = dataTypes.map(dt => mapToHKDataType(dt) as QuantityTypeIdentifier);
      
      // Check which types have anchors
      const anchorStatuses = await Promise.all(
        hkDataTypes.map(async (hkType, index) => ({
          dataType: dataTypes[index],
          hkType,
          hasAnchor: await anchorStore.getAnchor(hkType) !== null
        }))
      );
      
      // Separate types that can use anchored queries vs those that need regular queries
      const anchoredTypes = anchorStatuses.filter(s => s.hasAnchor);
      const regularTypes = anchorStatuses.filter(s => !s.hasAnchor);
      
      const results: Record<string, HealthDataAdapter[]> = {};
      
      // Process anchored queries in parallel
      if (anchoredTypes.length > 0) {
        const syncResults = await healthKitSyncManager.syncMultipleDataTypes(
          anchoredTypes.map(t => t.hkType),
          {
            unit: params.ios?.unit,
            limit: params.pageSize || 100,
            startDate: params.startDate,
            endDate: params.endDate,
          }
        );
        
        syncResults.forEach((syncResult, index) => {
          const dataType = anchoredTypes[index].dataType;
          results[dataType] = syncResult.newSamples.map(sample => 
            convertSample(sample, dataType)
          );
        });
      }
      
      // Process regular queries for types without anchors
      if (regularTypes.length > 0) {
        const regularResults = await Promise.all(
          regularTypes.map(async ({ dataType }) => {
            const data = await getHealthData(dataType, params);
            return { dataType, data };
          })
        );
        
        regularResults.forEach(({ dataType, data }) => {
          results[dataType] = data;
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error fetching batch health data:', error);
      return {};
    }
  };

  /**
   * Get platform-specific health data
   */
  const getPlatformHealthData = async <T = any>(
    dataType: string,
    params: QueryParams
  ): Promise<T[]> => {
    try {
      const hkDataType = mapToHKDataType(dataType) as QuantityTypeIdentifier;
      
      // For platform-specific data, we still support both modes
      const hasAnchor = await anchorStore.getAnchor(hkDataType);
      
      if (hasAnchor && params.useAnchored !== false) {
        const syncResult = await healthKitSyncManager.syncQuantityData(hkDataType, {
          unit: params.ios?.unit,
          limit: params.pageSize || 100,
          startDate: params.startDate,
          endDate: params.endDate,
        });
        
        return syncResult.newSamples as unknown as T[];
      } else {
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
      }
    } catch (error) {
      console.error('Error fetching platform health data:', error);
      return [];
    }
  };

  // Additional helper methods for anchor management
  const getSyncStatus = async (dataType: string) => {
    const hkDataType = mapToHKDataType(dataType) as QuantityTypeIdentifier;
    return healthKitSyncManager.getSyncStatus(hkDataType);
  };
  
  const forceFullResync = async (dataType: string) => {
    const hkDataType = mapToHKDataType(dataType) as QuantityTypeIdentifier;
    return healthKitSyncManager.forceFullResync(hkDataType);
  };
  
  const clearAllAnchors = async () => {
    return healthKitSyncManager.clearAllAnchors();
  };

  return {
    isAvailable,
    platform: 'ios',
    authStatus: authStatus || AuthorizationRequestStatus.unknown,
    requestAuth,
    AuthorizationRequestStatus,
    getHealthData,
    getBatchData,
    getPlatformHealthData,
    // Extended API for anchor management
    getSyncStatus,
    forceFullResync,
    clearAllAnchors,
  } as HealthServiceHook & {
    getSyncStatus: typeof getSyncStatus;
    forceFullResync: typeof forceFullResync;
    clearAllAnchors: typeof clearAllAnchors;
  };
};

// For Android implementation, you would:
// 1. Use Google Fit History API with sync tokens instead of anchors
// 2. Store sync tokens in Android's EncryptedSharedPreferences
// 3. Use GoogleFit.getHistoryDelta() for incremental syncs
// 4. Handle data differently as Google Fit uses DataPoints instead of samples
// Example Android sync flow:
// const syncToken = await androidSecureStorage.getSyncToken(dataType);
// const response = await GoogleFit.getHistoryDelta({
//   dataType: mapToGoogleFitType(dataType),
//   syncToken: syncToken || undefined,
// });
// await androidSecureStorage.setSyncToken(dataType, response.nextSyncToken);
// return convertGoogleFitData(response.dataPoints);