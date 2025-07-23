import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={80} color="white" />
          </View>
          
          <Text style={styles.subtitle}>
            Securely sync your health data to the cloud
          </Text>
          
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={24} color="white" />
              <Text style={styles.featureText}>End-to-end encryption</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="sync" size={24} color="white" />
              <Text style={styles.featureText}>Automatic background sync</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="lock-closed" size={24} color="white" />
              <Text style={styles.featureText}>Your data stays private</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={onNext}>
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#4c669f" />
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
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    marginBottom: 50,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
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
    color: '#4c669f',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
});