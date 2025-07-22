import HKHealthKit, {
  QuantityTypeIdentifier,
  QuantitySample,
  WorkoutSample,
  queryQuantitySamplesWithAnchor,
  queryWorkoutSamplesWithAnchor,
  DeletedSample,
  QuantitySamplesWithAnchorResponse,
  QueryWorkoutSamplesWithAnchorResponse,
} from '@kingstinct/react-native-healthkit';
import { anchorStore, DataTypeIdentifier } from './AnchorStore';
import { healthDataCache } from './HealthDataCache';
import { Platform } from 'react-native';

export interface SyncResult<T> {
  newSamples: T[];
  deletedSampleIds: string[];
  anchor: string;
  dataType: DataTypeIdentifier;
  syncDate: Date;
}

export interface SyncOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  unit?: string;
}

export class HealthKitSyncManager {
  private isSyncing: Map<DataTypeIdentifier, boolean> = new Map();
  private pendingPromises: Map<DataTypeIdentifier, Promise<SyncResult<QuantitySample>>> = new Map();
  
  /**
   * Sync quantity data using anchored queries
   * This efficiently fetches only new or changed data since last sync
   */
  async syncQuantityData(
    identifier: QuantityTypeIdentifier,
    options: SyncOptions = {}
  ): Promise<SyncResult<QuantitySample>> {
    // If already syncing, return the existing promise instead of throwing
    const existingPromise = this.pendingPromises.get(identifier);
    if (existingPromise) {
      console.log(`🔄 Waiting for existing sync of ${identifier} to complete...`);
      return existingPromise;
    }
    
    // Create the sync promise and store it
    const syncPromise = this.performSync(identifier, options);
    this.pendingPromises.set(identifier, syncPromise);
    this.isSyncing.set(identifier, true);
    
    try {
      const result = await syncPromise;
      return result;
    } finally {
      this.isSyncing.set(identifier, false);
      this.pendingPromises.delete(identifier);
    }
  }
  
  private async performSync(
    identifier: QuantityTypeIdentifier,
    options: SyncOptions = {}
  ): Promise<SyncResult<QuantitySample>> {
    try {
      // Get the last anchor for this data type
      const lastAnchor = await anchorStore.getAnchor(identifier);
      console.log(`⚓ Anchor for ${identifier}: ${lastAnchor ? 'EXISTS' : 'NOT FOUND'}`);
      
      // Prepare query options
      const queryOptions = {
        anchor: lastAnchor || undefined,
        unit: options.unit,
        limit: options.limit,
        filter: options.startDate ? {
          startDate: options.startDate,
          endDate: options.endDate || new Date(),
        } : undefined,
      };
      
      // Execute anchored query
      const response: QuantitySamplesWithAnchorResponse = await queryQuantitySamplesWithAnchor(
        identifier,
        queryOptions
      );
      
      // Save the new anchor for next sync
      await anchorStore.setAnchor(identifier, response.newAnchor);
      
      // Process deleted samples if needed
      if (response.deletedSamples && response.deletedSamples.length > 0) {
        await this.handleDeletedSamples(identifier, response.deletedSamples);
        // Remove deleted samples from cache
        await healthDataCache.removeDeletedSamples(
          identifier,
          response.deletedSamples.map(d => d.uuid)
        );
      }
      
      // Add new samples to cache
      if (response.samples.length > 0) {
        await healthDataCache.addNewSamples(identifier, [...response.samples]);
      }
      
      return {
        newSamples: [...response.samples], // Create mutable copy
        deletedSampleIds: response.deletedSamples?.map(d => d.uuid) || [],
        anchor: response.newAnchor,
        dataType: identifier,
        syncDate: new Date(),
      };
      
      // For Android: Would use Google Fit History API with sync tokens
      // if (Platform.OS === 'android') {
      //   const response = await GoogleFit.getHistory({
      //     dataType: this.mapToGoogleFitType(identifier),
      //     syncToken: lastAnchor,
      //   });
      //   return this.mapGoogleFitResponse(response);
      // }
    } catch (error) {
      console.error(`Error in performSync for ${identifier}:`, error);
      throw error;
    }
  }
  
  /**
   * Get cached data with optional sync if cache is empty/old
   */
  async getCachedDataWithSync(
    identifier: QuantityTypeIdentifier,
    options: SyncOptions = {},
    maxCacheAgeMs?: number
  ): Promise<QuantitySample[]> {
    // First try to get cached data
    const cachedData = await healthDataCache.getCachedData(identifier, maxCacheAgeMs);
    
    if (cachedData && cachedData.length > 0) {
      // Return cached data, but also trigger a background sync for fresh data
      this.syncQuantityData(identifier, options).catch(error => {
        console.warn(`Background sync failed for ${identifier}:`, error);
      });
      
      return cachedData;
    }
    
    // No cached data, perform sync and return results
    const syncResult = await this.syncQuantityData(identifier, options);
    return syncResult.newSamples;
  }
  
  /**
   * Sync workout data using anchored queries
   */
  async syncWorkoutData(
    options: SyncOptions = {}
  ): Promise<SyncResult<WorkoutSample>> {
    const dataType: DataTypeIdentifier = 'workout';
    
    if (this.isSyncing.get(dataType)) {
      throw new Error('Already syncing workouts');
    }
    
    this.isSyncing.set(dataType, true);
    
    try {
      const lastAnchor = await anchorStore.getAnchor(dataType);
      
      const queryOptions = {
        anchor: lastAnchor || undefined,
        limit: options.limit,
        filter: options.startDate ? {
          startDate: options.startDate,
          endDate: options.endDate || new Date(),
        } : undefined,
      };
      
      const response: QueryWorkoutSamplesWithAnchorResponse = await queryWorkoutSamplesWithAnchor(
        queryOptions
      );
      
      await anchorStore.setAnchor(dataType, response.newAnchor);
      
      if (response.deletedSamples && response.deletedSamples.length > 0) {
        await this.handleDeletedSamples(dataType, response.deletedSamples);
      }
      
      // Convert WorkoutProxy to WorkoutSample (simplified for now)
      const workoutSamples: WorkoutSample[] = response.workouts.map(proxy => ({
        uuid: proxy.uuid,
        workoutActivityType: proxy.workoutActivityType,
        duration: proxy.duration,
        totalDistance: proxy.totalDistance,
        totalEnergyBurned: proxy.totalEnergyBurned,
        startDate: proxy.startDate,
        endDate: proxy.endDate,
        metadata: proxy.metadata,
        sourceRevision: proxy.sourceRevision,
      } as WorkoutSample));
      
      return {
        newSamples: workoutSamples,
        deletedSampleIds: response.deletedSamples?.map(d => d.uuid) || [],
        anchor: response.newAnchor,
        dataType,
        syncDate: new Date(),
      };
    } finally {
      this.isSyncing.set(dataType, false);
    }
  }
  
  /**
   * Sync multiple data types in parallel
   */
  async syncMultipleDataTypes(
    dataTypes: QuantityTypeIdentifier[],
    options: SyncOptions = {}
  ): Promise<SyncResult<QuantitySample>[]> {
    const syncPromises = dataTypes.map(dataType => 
      this.syncQuantityData(dataType, options)
    );
    
    return Promise.all(syncPromises);
  }
  
  /**
   * Handle deleted samples - implement your deletion logic here
   */
  private async handleDeletedSamples(
    dataType: DataTypeIdentifier,
    deletedSamples: readonly DeletedSample[]
  ): Promise<void> {
    // This is where you would handle deleted samples in your local database
    // For now, just log them
    console.log(`Handling ${deletedSamples.length} deleted samples for ${dataType}`);
    
    // Example implementation:
    // for (const deleted of deletedSamples) {
    //   await localDatabase.markAsDeleted(dataType, deleted.uuid);
    // }
    
    // For Android: Would handle deletions from Google Fit
    // if (Platform.OS === 'android') {
    //   await this.androidDataStore.removeDeletedSamples(deletedSamples);
    // }
  }
  
  /**
   * Check if initial sync is needed (no anchor exists)
   */
  async needsInitialSync(dataType: DataTypeIdentifier): Promise<boolean> {
    const anchor = await anchorStore.getAnchor(dataType);
    return anchor === null;
  }
  
  /**
   * Get sync status for a data type
   */
  async getSyncStatus(dataType: DataTypeIdentifier): Promise<{
    lastSyncDate: Date | null;
    hasAnchor: boolean;
    isSyncing: boolean;
  }> {
    const lastSyncDate = await anchorStore.getLastSyncDate(dataType);
    const anchor = await anchorStore.getAnchor(dataType);
    
    return {
      lastSyncDate,
      hasAnchor: anchor !== null,
      isSyncing: this.isSyncing.get(dataType) || false,
    };
  }
  
  /**
   * Force a full resync by clearing the anchor
   */
  async forceFullResync(dataType: DataTypeIdentifier): Promise<void> {
    await anchorStore.clearAnchor(dataType);
  }
  
  /**
   * Clear all anchors and force full resync
   */
  async clearAllAnchors(): Promise<void> {
    await anchorStore.clearAllAnchors();
  }
}

// Singleton instance
export const healthKitSyncManager = new HealthKitSyncManager();