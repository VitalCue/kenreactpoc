import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { useHealthServiceAnchored } from '../services/health/platforms/ios/service-anchored';
import { QuantityTypeIdentifier } from '@kingstinct/react-native-healthkit';
import { anchorStore } from '../../src/services/healthkit/AnchorStore';

export const HealthDataSyncExample: React.FC = () => {
  const healthService = useHealthServiceAnchored();
  const [syncStatus, setSyncStatus] = useState<Record<string, any>>({});
  const [lastSyncData, setLastSyncData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Data types to sync
  const dataTypesToSync = [
    { type: 'stepCount', unit: 'count' },
    { type: 'heartRate', unit: 'count/min' },
    { type: 'activeEnergyBurned', unit: 'kcal' },
  ];

  useEffect(() => {
    // Check initial sync status
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    const status: Record<string, any> = {};
    
    for (const { type } of dataTypesToSync) {
      const typeStatus = await healthService.getSyncStatus(type);
      status[type] = typeStatus;
    }
    
    setSyncStatus(status);
  };

  const performSync = async (dataType: string, unit?: string) => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days

      const data = await healthService.getHealthData(dataType, {
        startDate,
        endDate,
        pageSize: 100,
        useAnchored: true, // Use anchored queries
        onDeletedSamples: (deletedIds) => {
          console.log(`Deleted ${deletedIds.length} samples for ${dataType}`);
        },
        ios: {
          unit,
        },
      });

      setLastSyncData(prev => ({
        ...prev,
        [dataType]: {
          count: data.length,
          lastSample: data[data.length - 1],
          syncTime: new Date().toISOString(),
        },
      }));

      // Refresh sync status
      await checkSyncStatus();
    } catch (error) {
      console.error(`Error syncing ${dataType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const performBatchSync = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const results = await healthService.getBatchData(
        dataTypesToSync.map(d => d.type),
        {
          startDate,
          endDate,
          pageSize: 100,
          useAnchored: true,
        }
      );

      const syncData: Record<string, any> = {};
      
      Object.entries(results).forEach(([dataType, data]) => {
        syncData[dataType] = {
          count: data.length,
          lastSample: data[data.length - 1],
          syncTime: new Date().toISOString(),
        };
      });

      setLastSyncData(syncData);
      await checkSyncStatus();
    } catch (error) {
      console.error('Error in batch sync:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAnchor = async (dataType: string) => {
    await healthService.forceFullResync(dataType);
    await checkSyncStatus();
  };

  const clearAllAnchors = async () => {
    await healthService.clearAllAnchors();
    await checkSyncStatus();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>HealthKit Anchored Query Demo</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Batch Operations</Text>
        <Button
          title="Sync All Data Types"
          onPress={performBatchSync}
          disabled={loading}
        />
        <Button
          title="Clear All Anchors"
          onPress={clearAllAnchors}
          disabled={loading}
        />
      </View>

      {dataTypesToSync.map(({ type, unit }) => (
        <View key={type} style={styles.dataTypeSection}>
          <Text style={styles.dataTypeTitle}>{type}</Text>
          
          <View style={styles.statusContainer}>
            <Text>Has Anchor: {syncStatus[type]?.hasAnchor ? 'Yes' : 'No'}</Text>
            <Text>
              Last Sync: {
                syncStatus[type]?.lastSyncDate 
                  ? new Date(syncStatus[type].lastSyncDate).toLocaleString()
                  : 'Never'
              }
            </Text>
            <Text>Is Syncing: {syncStatus[type]?.isSyncing ? 'Yes' : 'No'}</Text>
          </View>

          {lastSyncData[type] && (
            <View style={styles.syncResultContainer}>
              <Text style={styles.syncResultTitle}>Last Sync Result:</Text>
              <Text>Samples: {lastSyncData[type].count}</Text>
              <Text>Synced at: {new Date(lastSyncData[type].syncTime).toLocaleTimeString()}</Text>
              {lastSyncData[type].lastSample && (
                <Text>
                  Latest: {lastSyncData[type].lastSample.amount} {lastSyncData[type].lastSample.unit}
                </Text>
              )}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Sync"
              onPress={() => performSync(type, unit)}
              disabled={loading}
            />
            <Button
              title="Clear Anchor"
              onPress={() => clearAnchor(type)}
              disabled={loading}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  dataTypeSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  dataTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  statusContainer: {
    marginBottom: 10,
  },
  syncResultContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f4f8',
    borderRadius: 4,
  },
  syncResultTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});