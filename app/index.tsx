import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useHealthService, HealthServiceUtils } from './services/health';
import type { HealthDataAdapter } from './services/health';
import { useRouter } from 'expo-router';

export default function Index() {
  const healthService = useHealthService();
  const router = useRouter();
  const [healthData, setHealthData] = useState<Record<string, HealthDataAdapter[]>>({});
  const [healthSummary, setHealthSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if health service is available
  useEffect(() => {
    if (!healthService.isAvailable) {
      setError('Health service is not available on this device');
    }
  }, [healthService.isAvailable]);

  const requestPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const status = await healthService.requestAuth([
        'steps',
        'distance', 
        'calories',
        'walkingSpeed',
        'runningSpeed'
      ]);
      
      console.log('Permission status:', status);
    } catch (err) {
      setError(`Error requesting permissions: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const readHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

      const params = {
        startDate: startOfDay,
        endDate: endOfDay,
        pageSize: 100,
      };

      const data = await healthService.getBatchData(
        ['steps', 'distance', 'calories', 'walkingSpeed', 'runningSpeed'],
        params
      );

      setHealthData(data);
      console.log('Health data:', data);
    } catch (err) {
      setError(`Error reading health data: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getHealthSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const summary = await HealthServiceUtils.getHealthSummary(healthService);
      setHealthSummary(summary);
      console.log("HealthSummary", JSON.stringify(summary))
      
    } catch (err) {
      setError(`Error getting health summary: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const renderHealthData = () => {
    if (!healthData || Object.keys(healthData).length === 0) {
      return <Text style={styles.noData}>No health data available</Text>;
    }

    return (
      <View style={styles.dataContainer}>
        <Text style={styles.sectionTitle}>Today's Health Data</Text>
        {Object.entries(healthData).map(([dataType, records]) => (
          <View key={dataType} style={styles.dataTypeContainer}>
            <Text style={styles.dataType}>{dataType.toUpperCase()}</Text>
            <Text style={styles.dataCount}>Records: {records.length}</Text>
            {records.length > 0 && (
              <Text style={styles.dataValue}>
                Latest: {records[0].amount} {records[0].unit}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderHealthSummary = () => {
    if (!healthSummary) return null;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Health Summary</Text>
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Today</Text>
          {Object.entries(healthSummary.today).map(([key, value]: [string, any]) => (
            <Text key={key} style={styles.summaryItem}>
              {key}: {value.total} (avg: {value.average})
            </Text>
          ))}
        </View>
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Weekly</Text>
          {Object.entries(healthSummary.weekly).map(([key, value]: [string, any]) => (
            key !== 'dailyBreakdown' && (
              <Text key={key} style={styles.summaryItem}>
                {key}: {value.total} (avg: {value.average})
              </Text>
            )
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Health Service Demo</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Platform: {healthService.platform || 'Unknown'}
          </Text>
          <Text style={styles.statusText}>
            Available: {healthService.isAvailable ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.statusText}>
            Auth Status: {healthService.authStatus}
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={requestPermissions}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Request Permissions'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={readHealthData}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Read Health Data'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={getHealthSummary}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Get Health Summary'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.dashboardButton]} 
            onPress={() => router.push('./dashboard')}
          >
            <Text style={styles.buttonText}>
              Open Health Dashboard
            </Text>
          </TouchableOpacity>
        </View>

        {renderHealthData()}
        {renderHealthSummary()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  error: {
    color: 'red',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  dashboardButton: {
    backgroundColor: '#FF6B6B',
  },
  dataContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  dataTypeContainer: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dataType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  dataCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summarySection: {
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  summaryItem: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
});