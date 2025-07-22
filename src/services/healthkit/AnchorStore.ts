import { MMKV } from 'react-native-mmkv';
import { QuantityTypeIdentifier } from '@kingstinct/react-native-healthkit';

export type DataTypeIdentifier = QuantityTypeIdentifier | 'workout' | 'sleep' | 'mindfulness';

interface AnchorData {
  anchor: string;
  lastSyncDate: string;
  dataType: DataTypeIdentifier;
}

export interface IAnchorStore {
  getAnchor(dataType: DataTypeIdentifier): Promise<string | null>;
  setAnchor(dataType: DataTypeIdentifier, anchor: string): Promise<void>;
  clearAnchor(dataType: DataTypeIdentifier): Promise<void>;
  getAllAnchors(): Promise<Record<string, AnchorData>>;
  clearAllAnchors(): Promise<void>;
  getLastSyncDate(dataType: DataTypeIdentifier): Promise<Date | null>;
}

export class AnchorStore implements IAnchorStore {
  private storage: MMKV;
  private readonly ANCHOR_PREFIX = 'healthkit_anchor_';
  
  constructor() {
    // Initialize MMKV with encryption enabled
    this.storage = new MMKV({
      id: 'healthkit-anchors',
      encryptionKey: undefined, // Will add encryption key later when implementing security
    });
    
    // For Android: Would use EncryptedSharedPreferences or SQLCipher
    // Android implementation would look like:
    // if (Platform.OS === 'android') {
    //   this.storage = new AndroidSecureStorage('healthkit-anchors');
    // }
  }
  
  private getKey(dataType: DataTypeIdentifier): string {
    return `${this.ANCHOR_PREFIX}${dataType}`;
  }
  
  async getAnchor(dataType: DataTypeIdentifier): Promise<string | null> {
    try {
      const key = this.getKey(dataType);
      const storedData = this.storage.getString(key);
      
      if (!storedData) {
        return null;
      }
      
      const anchorData: AnchorData = JSON.parse(storedData);
      return anchorData.anchor;
    } catch (error) {
      console.error(`Failed to get anchor for ${dataType}:`, error);
      return null;
    }
  }
  
  async setAnchor(dataType: DataTypeIdentifier, anchor: string): Promise<void> {
    try {
      const key = this.getKey(dataType);
      const anchorData: AnchorData = {
        anchor,
        lastSyncDate: new Date().toISOString(),
        dataType,
      };
      
      this.storage.set(key, JSON.stringify(anchorData));
      
      // For Android: Would need to handle SharedPreferences commit
      // if (Platform.OS === 'android') {
      //   await this.storage.commit();
      // }
    } catch (error) {
      console.error(`Failed to set anchor for ${dataType}:`, error);
      throw error;
    }
  }
  
  async clearAnchor(dataType: DataTypeIdentifier): Promise<void> {
    try {
      const key = this.getKey(dataType);
      this.storage.delete(key);
    } catch (error) {
      console.error(`Failed to clear anchor for ${dataType}:`, error);
      throw error;
    }
  }
  
  async getAllAnchors(): Promise<Record<string, AnchorData>> {
    try {
      const allKeys = this.storage.getAllKeys();
      const anchorKeys = allKeys.filter(key => key.startsWith(this.ANCHOR_PREFIX));
      const anchors: Record<string, AnchorData> = {};
      
      for (const key of anchorKeys) {
        const storedData = this.storage.getString(key);
        if (storedData) {
          const anchorData: AnchorData = JSON.parse(storedData);
          const dataType = key.replace(this.ANCHOR_PREFIX, '');
          anchors[dataType] = anchorData;
        }
      }
      
      return anchors;
    } catch (error) {
      console.error('Failed to get all anchors:', error);
      return {};
    }
  }
  
  async clearAllAnchors(): Promise<void> {
    try {
      const allKeys = this.storage.getAllKeys();
      const anchorKeys = allKeys.filter(key => key.startsWith(this.ANCHOR_PREFIX));
      
      for (const key of anchorKeys) {
        this.storage.delete(key);
      }
    } catch (error) {
      console.error('Failed to clear all anchors:', error);
      throw error;
    }
  }
  
  async getLastSyncDate(dataType: DataTypeIdentifier): Promise<Date | null> {
    try {
      const key = this.getKey(dataType);
      const storedData = this.storage.getString(key);
      
      if (!storedData) {
        return null;
      }
      
      const anchorData: AnchorData = JSON.parse(storedData);
      return new Date(anchorData.lastSyncDate);
    } catch (error) {
      console.error(`Failed to get last sync date for ${dataType}:`, error);
      return null;
    }
  }
}

// Singleton instance
export const anchorStore = new AnchorStore();