import { doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useHealthService } from '../health';
import { HealthDataEncryption } from '../encryption/health-data-encryption';
import type { HealthDataAdapter } from '../health/types';

interface SyncMetadata {
  lastSyncTime: Date;
  dataTypesSynced: string[];
  totalSamplesSynced: number;
  errors: string[];
}

interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  metadata: SyncMetadata;
}

export class HealthDataSyncService {
  private userId: string;
  private healthService: ReturnType<typeof useHealthService>;

  constructor(userId: string, healthService: ReturnType<typeof useHealthService>) {
    this.userId = userId;
    this.healthService = healthService;
  }

  /**
   * Sync all health data for the current user
   */
  async syncAllHealthData(): Promise<SyncResult> {
    const dataTypes = ['steps', 'heartRate', 'calories', 'distance', 'workouts'];
    const startTime = new Date();
    let totalSynced = 0;
    const errors: string[] = [];
    const syncedTypes: string[] = [];

    console.log('🔄 Starting health data sync for user:', this.userId);

    try {
      // Get health data for the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const queryParams = {
        startDate,
        endDate,
        pageSize: 1000, // Batch size
        useAnchored: true, // Use efficient incremental sync
      };

      // Sync each data type
      for (const dataType of dataTypes) {
        try {
          console.log(`📊 Syncing ${dataType}...`);
          const healthData = await this.healthService.getHealthData(dataType, queryParams);
          
          if (healthData.length > 0) {
            const syncCount = await this.uploadHealthData(dataType, healthData);
            totalSynced += syncCount;
            syncedTypes.push(dataType);
            console.log(`✅ Synced ${syncCount} ${dataType} samples`);
          } else {
            console.log(`⚪ No new ${dataType} data to sync`);
          }
        } catch (error: any) {
          const errorMsg = `Failed to sync ${dataType}: ${error.message}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
        }
      }

      // Save sync metadata
      await this.saveSyncMetadata({
        lastSyncTime: new Date(),
        dataTypesSynced: syncedTypes,
        totalSamplesSynced: totalSynced,
        errors,
      });

      const result = {
        success: errors.length === 0,
        synced: totalSynced,
        errors,
        metadata: {
          lastSyncTime: new Date(),
          dataTypesSynced: syncedTypes,
          totalSamplesSynced: totalSynced,
          errors,
        },
      };

      console.log('🎉 Sync complete:', result);
      return result;

    } catch (error: any) {
      console.error('💥 Sync failed:', error);
      return {
        success: false,
        synced: totalSynced,
        errors: [error.message],
        metadata: {
          lastSyncTime: startTime,
          dataTypesSynced: syncedTypes,
          totalSamplesSynced: totalSynced,
          errors: [error.message],
        },
      };
    }
  }

  /**
   * Upload health data to Firestore
   */
  private async uploadHealthData(dataType: string, samples: HealthDataAdapter[]): Promise<number> {
    if (samples.length === 0) return 0;

    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500; // Firestore limit

    for (const sample of samples) {
      // Prepare data for secure storage
      const secureData = HealthDataEncryption.prepareForStorage({
        value: sample.amount,
        unit: sample.unit,
        timestamp: new Date(sample.startDate),
        source: sample.dataOrigin || 'Unknown',
        metadata: {
          platform: this.healthService.platform,
          dataType,
          syncTime: serverTimestamp(),
        },
      });

      // Create document reference using startDate
      const timestamp = new Date(sample.startDate).getTime();
      const sampleId = await HealthDataEncryption.hashIdentifier(
        `${timestamp}_${sample.amount}_${dataType}`
      );
      
      const docRef = doc(
        db,
        'users',
        this.userId,
        'healthData',
        dataType,
        'samples',
        sampleId
      );

      batch.set(docRef, secureData);
      batchCount++;

      // Commit batch when it reaches the limit
      if (batchCount >= maxBatchSize) {
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining items
    if (batchCount > 0) {
      await batch.commit();
    }

    return samples.length;
  }

  /**
   * Save sync metadata to Firestore
   */
  private async saveSyncMetadata(metadata: SyncMetadata): Promise<void> {
    const metadataRef = doc(db, 'users', this.userId, 'syncMetadata', 'latest');
    
    await setDoc(metadataRef, {
      ...metadata,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Get the last sync time for this user
   */
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const { getDoc } = await import('firebase/firestore');
      const metadataRef = doc(db, 'users', this.userId, 'syncMetadata', 'latest');
      const snapshot = await getDoc(metadataRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return data.lastSyncTime?.toDate() || null;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  /**
   * Check if sync is needed (based on time since last sync)
   */
  async shouldSync(intervalMinutes: number = 30): Promise<boolean> {
    const lastSync = await this.getLastSyncTime();
    
    if (!lastSync) {
      return true; // First sync
    }
    
    const now = new Date();
    const timeDiff = now.getTime() - lastSync.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff >= intervalMinutes;
  }
}