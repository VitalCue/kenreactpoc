import { MMKV } from 'react-native-mmkv';
import { QuantitySample } from '@kingstinct/react-native-healthkit';
import { DataTypeIdentifier } from './AnchorStore';

interface CachedHealthData {
  samples: QuantitySample[];
  lastFetch: string;
  dataType: DataTypeIdentifier;
  queryParams?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  };
}

export interface IHealthDataCache {
  getCachedData(dataType: DataTypeIdentifier, maxAgeMs?: number): Promise<QuantitySample[] | null>;
  setCachedData(dataType: DataTypeIdentifier, samples: QuantitySample[], queryParams?: any): Promise<void>;
  addNewSamples(dataType: DataTypeIdentifier, newSamples: QuantitySample[]): Promise<void>;
  removeDeletedSamples(dataType: DataTypeIdentifier, deletedUuids: string[]): Promise<void>;
  clearCache(dataType?: DataTypeIdentifier): Promise<void>;
  getCacheStats(): Promise<Record<string, { count: number; lastFetch: Date | null }>>;
}

export class HealthDataCache implements IHealthDataCache {
  private storage: MMKV;
  private readonly CACHE_PREFIX = 'healthkit_cache_';
  private readonly DEFAULT_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
  
  constructor() {
    this.storage = new MMKV({
      id: 'healthkit-cache',
      encryptionKey: undefined, // Will add encryption key later when implementing security
    });
  }
  
  private getKey(dataType: DataTypeIdentifier): string {
    return `${this.CACHE_PREFIX}${dataType}`;
  }
  
  async getCachedData(dataType: DataTypeIdentifier, maxAgeMs?: number): Promise<QuantitySample[] | null> {
    try {
      const key = this.getKey(dataType);
      const storedData = this.storage.getString(key);
      
      if (!storedData) {
        return null;
      }
      
      const cachedData: CachedHealthData = JSON.parse(storedData);
      const maxAge = maxAgeMs || this.DEFAULT_MAX_AGE_MS;
      const cacheAge = Date.now() - new Date(cachedData.lastFetch).getTime();
      
      // Check if cache is still valid
      if (cacheAge > maxAge) {
        console.log(`🗑️ Cache expired for ${dataType} (age: ${Math.round(cacheAge / 1000)}s)`);
        return null;
      }
      
      console.log(`💾 Cache hit for ${dataType} (${cachedData.samples.length} samples, age: ${Math.round(cacheAge / 1000)}s)`);
      
      // Convert dates back to Date objects
      return cachedData.samples.map(sample => ({
        ...sample,
        startDate: new Date(sample.startDate),
        endDate: new Date(sample.endDate),
      }));
    } catch (error) {
      console.error(`Failed to get cached data for ${dataType}:`, error);
      return null;
    }
  }
  
  async setCachedData(dataType: DataTypeIdentifier, samples: QuantitySample[], queryParams?: any): Promise<void> {
    try {
      const key = this.getKey(dataType);
      const cachedData: CachedHealthData = {
        samples: samples.map(sample => ({
          ...sample,
          startDate: sample.startDate.toISOString() as any,
          endDate: sample.endDate.toISOString() as any,
        })),
        lastFetch: new Date().toISOString(),
        dataType,
        queryParams: queryParams ? {
          startDate: queryParams.startDate?.toISOString(),
          endDate: queryParams.endDate?.toISOString(),
          limit: queryParams.limit,
        } : undefined,
      };
      
      this.storage.set(key, JSON.stringify(cachedData));
      console.log(`💾 Cached ${samples.length} samples for ${dataType}`);
    } catch (error) {
      console.error(`Failed to cache data for ${dataType}:`, error);
      throw error;
    }
  }
  
  async addNewSamples(dataType: DataTypeIdentifier, newSamples: QuantitySample[]): Promise<void> {
    try {
      const existingData = await this.getCachedData(dataType, Infinity); // Get regardless of age
      const allSamples = existingData ? [...existingData, ...newSamples] : newSamples;
      
      // Remove duplicates by UUID and sort by startDate
      const uniqueSamples = Array.from(
        new Map(allSamples.map(sample => [sample.uuid, sample])).values()
      ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      await this.setCachedData(dataType, uniqueSamples);
      console.log(`➕ Added ${newSamples.length} new samples to cache for ${dataType} (total: ${uniqueSamples.length})`);
    } catch (error) {
      console.error(`Failed to add new samples for ${dataType}:`, error);
      throw error;
    }
  }
  
  async removeDeletedSamples(dataType: DataTypeIdentifier, deletedUuids: string[]): Promise<void> {
    try {
      const existingData = await this.getCachedData(dataType, Infinity); // Get regardless of age
      if (!existingData || deletedUuids.length === 0) {
        return;
      }
      
      const filteredSamples = existingData.filter(sample => !deletedUuids.includes(sample.uuid));
      await this.setCachedData(dataType, filteredSamples);
      
      console.log(`🗑️ Removed ${deletedUuids.length} deleted samples from cache for ${dataType}`);
    } catch (error) {
      console.error(`Failed to remove deleted samples for ${dataType}:`, error);
      throw error;
    }
  }
  
  async clearCache(dataType?: DataTypeIdentifier): Promise<void> {
    try {
      if (dataType) {
        const key = this.getKey(dataType);
        this.storage.delete(key);
        console.log(`🗑️ Cleared cache for ${dataType}`);
      } else {
        const allKeys = this.storage.getAllKeys();
        const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));
        
        for (const key of cacheKeys) {
          this.storage.delete(key);
        }
        console.log(`🗑️ Cleared all health data cache (${cacheKeys.length} entries)`);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }
  
  async getCacheStats(): Promise<Record<string, { count: number; lastFetch: Date | null }>> {
    try {
      const allKeys = this.storage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const stats: Record<string, { count: number; lastFetch: Date | null }> = {};
      
      for (const key of cacheKeys) {
        const storedData = this.storage.getString(key);
        if (storedData) {
          const cachedData: CachedHealthData = JSON.parse(storedData);
          const dataType = key.replace(this.CACHE_PREFIX, '');
          stats[dataType] = {
            count: cachedData.samples.length,
            lastFetch: new Date(cachedData.lastFetch),
          };
        }
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {};
    }
  }
}

// Singleton instance
export const healthDataCache = new HealthDataCache();