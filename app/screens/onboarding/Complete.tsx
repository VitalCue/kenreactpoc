import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface CompleteScreenProps {
  onComplete: () => void;
}

export default function CompleteScreen({ onComplete }: CompleteScreenProps) {
  return (
    <LinearGradient
      colors={['#4CAF50', '#45a049', '#2e7d32']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={100} color="white" />
          </View>
          
          <Text style={styles.subtitle}>
            Your health data sync is now configured and ready to go.
          </Text>
          
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="sync" size={24} color="white" />
              <Text style={styles.featureText}>Background sync enabled</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={24} color="white" />
              <Text style={styles.featureText}>Data securely encrypted</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="cloud-upload" size={24} color="white" />
              <Text style={styles.featureText}>Automatic cloud backup</Text>
            </View>
          </View>
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.infoText}>
              Your health data will sync automatically in the background. 
              You can view sync status and manage settings in the dashboard.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={onComplete}>
            <Text style={styles.buttonText}>Go to Dashboard</Text>
            <Ionicons name="arrow-forward" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  features: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
});