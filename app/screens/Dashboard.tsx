import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useHealthService } from '../services/health';
import { HealthDataSyncService } from '../services/sync/HealthDataSyncService';
import { BackgroundSyncManager } from '../services/sync/BackgroundSyncManager';

interface DashboardScreenProps {
  syncService: HealthDataSyncService | null;
}

export default function DashboardScreen({ syncService }: DashboardScreenProps) {
  const { user, logout } = useAuth();
  const healthService = useHealthService();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('idle');
  const [backgroundSyncStatus, setBackgroundSyncStatus] = useState<string>('Unknown');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSyncStatus();
    loadBackgroundSyncStatus();
  }, [syncService]);

  const loadSyncStatus = async () => {
    if (syncService) {
      const lastSync = await syncService.getLastSyncTime();
      setLastSyncTime(lastSync);
    }
  };

  const loadBackgroundSyncStatus = async () => {
    const status = await BackgroundSyncManager.getBackgroundTaskStatus();
    setBackgroundSyncStatus(status);
  };

  const handleManualSync = async () => {
    if (!syncService || !user) return;

    setLoading(true);
    setSyncStatus('syncing');
    
    try {
      await BackgroundSyncManager.triggerManualSync(user.uid, healthService);
      setSyncStatus('completed');
      await loadSyncStatus(); // Refresh last sync time
      
      Alert.alert('Sync Complete', 'Your health data has been synced successfully.');
    } catch (error: any) {
      setSyncStatus('error');
      Alert.alert('Sync Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await BackgroundSyncManager.unregisterBackgroundSync();
              await logout();
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSyncTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return '#ff9800';
      case 'completed': return '#4caf50';
      case 'error': return '#f44336';
      default: return '#666';
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return 'sync';
      case 'completed': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      default: return 'cloud-upload';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Sync POC</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#4c669f" />
          </View>
          <Text style={styles.userEmail}>
            {user?.email || 'Anonymous User'}
          </Text>
        </View>

        {/* Sync Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons 
              name={getSyncStatusIcon() as any} 
              size={24} 
              color={getSyncStatusColor()} 
            />
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Sync:</Text>
            <Text style={styles.statusValue}>{formatLastSyncTime()}</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Background Sync:</Text>
            <Text style={[styles.statusValue, 
              { color: ['Active', 'Available'].includes(backgroundSyncStatus) ? '#4caf50' : '#f44336' }
            ]}>
              {backgroundSyncStatus}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Health Data:</Text>
            <Text style={[styles.statusValue,
              { color: healthService.isAvailable ? '#4caf50' : '#f44336' }
            ]}>
              {healthService.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>

        {/* Manual Sync */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="refresh" size={24} color="#4c669f" />
          </View>
          <Text style={styles.cardDescription}>
            Trigger an immediate sync of your health data to the cloud.
          </Text>
          
          <TouchableOpacity
            style={[styles.syncButton, loading && styles.syncButtonDisabled]}
            onPress={handleManualSync}
            disabled={loading || !syncService}
          >
            <Ionicons 
              name="cloud-upload" 
              size={20} 
              color="white" 
              style={{ marginRight: 10 }} 
            />
            <Text style={styles.syncButtonText}>
              {loading ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Health Data Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={24} color="#4c669f" />
          </View>
          
          <Text style={styles.cardDescription}>
            The following data types are being synced:
          </Text>
          
          <View style={styles.dataTypes}>
            {['Steps', 'Heart Rate', 'Calories', 'Distance', 'Workouts'].map((type) => (
              <View key={type} style={styles.dataType}>
                <Ionicons name="checkmark" size={16} color="#4caf50" />
                <Text style={styles.dataTypeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={[styles.card, styles.privacyCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#4caf50" />
          </View>
          <Text style={styles.privacyText}>
            Your health data is encrypted and stored securely. Only you have access to your data, 
            and you can delete it at any time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  syncButton: {
    backgroundColor: '#4c669f',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#ccc',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dataTypes: {
    marginTop: 10,
  },
  dataType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataTypeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  privacyCard: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});