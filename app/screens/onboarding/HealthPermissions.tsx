import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHealthService } from '../../services/health';
import { AuthorizationRequestStatus } from '../../services/health/types/auth';

interface HealthPermissionsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const HEALTH_DATA_TYPES = [
  { key: 'steps', label: 'Steps', icon: 'walk', description: 'Daily step count' },
  { key: 'heartRate', label: 'Heart Rate', icon: 'heart', description: 'Heart rate measurements' },
  { key: 'calories', label: 'Calories', icon: 'flame', description: 'Active and resting calories' },
  { key: 'distance', label: 'Distance', icon: 'location', description: 'Walking and running distance' },
  { key: 'workouts', label: 'Workouts', icon: 'fitness', description: 'Exercise sessions' },
];

export default function HealthPermissionsScreen({ onNext, onBack }: HealthPermissionsScreenProps) {
  const healthService = useHealthService();
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<AuthorizationRequestStatus | string>('');

  const requestHealthPermissions = async () => {
    if (!healthService.isAvailable) {
      Alert.alert(
        'Health Data Unavailable',
        'Health data is not available on this device or platform.',
        [{ text: 'Continue Anyway', onPress: onNext }]
      );
      return;
    }

    setLoading(true);
    try {
      const dataTypes = HEALTH_DATA_TYPES.map(type => type.key);
      const status = await healthService.requestAuth(dataTypes);
      
      setPermissionStatus(status);
      
      if (status === AuthorizationRequestStatus.unnecessary) {
        Alert.alert(
          'Permissions Granted',
          'Health data permissions have been granted successfully.',
          [{ text: 'Continue', onPress: onNext }]
        );
      } else if (status === AuthorizationRequestStatus.shouldRequest) {
        Alert.alert(
          'Permissions Needed',
          'Please grant health data permissions to continue.',
          [
            { text: 'Try Again', onPress: requestHealthPermissions },
            { text: 'Continue', onPress: onNext }
          ]
        );
      } else {
        Alert.alert(
          'Permissions Status Unknown',
          'Health permission status is unclear. You can try syncing data later.',
          [{ text: 'Continue', onPress: onNext }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Permission Error',
        `Failed to request health permissions: ${error.message}`,
        [
          { text: 'Try Again', onPress: requestHealthPermissions },
          { text: 'Skip', onPress: onNext }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (permissionStatus) {
      case AuthorizationRequestStatus.unnecessary:
        return '#4CAF50';
      case AuthorizationRequestStatus.shouldRequest:
        return '#ff9800';
      default:
        return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Permissions</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Ionicons name="medical" size={48} color="#4c669f" />
          <Text style={styles.description}>
            To sync your health data, we need permission to access the following data types:
          </Text>
        </View>

        <View style={styles.dataTypes}>
          {HEALTH_DATA_TYPES.map((dataType) => (
            <View key={dataType.key} style={styles.dataTypeCard}>
              <View style={styles.dataTypeIcon}>
                <Ionicons name={dataType.icon as any} size={24} color="#4c669f" />
              </View>
              <View style={styles.dataTypeContent}>
                <Text style={styles.dataTypeLabel}>{dataType.label}</Text>
                <Text style={styles.dataTypeDescription}>{dataType.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#4c669f" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Why We Need This</Text>
            <Text style={styles.infoText}>
              Health permissions allow us to automatically sync your data in the background. 
              You can always revoke these permissions in your device settings.
            </Text>
          </View>
        </View>

        {healthService.isAvailable && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Platform:</Text>
              <Text style={styles.statusValue}>{healthService.platform}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Available:</Text>
              <Text style={styles.statusValue}>{healthService.isAvailable ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Auth Status:</Text>
              <Text style={[styles.statusValue, { color: getStatusColor() }]}>
                {permissionStatus || healthService.authStatus || 'Not requested'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!healthService.isAvailable && (
          <Text style={styles.warningText}>
            ⚠️ Health data not available on this platform
          </Text>
        )}
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={requestHealthPermissions}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Requesting Permissions...' : 'Grant Health Permissions'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onNext}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  dataTypes: {
    marginBottom: 20,
  },
  dataTypeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dataTypeIcon: {
    marginRight: 15,
    justifyContent: 'center',
  },
  dataTypeContent: {
    flex: 1,
  },
  dataTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dataTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
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
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  warningText: {
    fontSize: 14,
    color: '#ff9800',
    textAlign: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4c669f',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
});