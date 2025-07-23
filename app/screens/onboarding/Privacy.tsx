import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PrivacyScreen({ onNext, onBack }: PrivacyScreenProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const canProceed = acceptedTerms && acceptedPrivacy;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Consent</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Ionicons name="lock-closed" size={48} color="#4c669f" />
          <Text style={styles.description}>
            We take your privacy seriously. Here's how we protect your health data:
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#4c669f" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Data Encryption</Text>
            <Text style={styles.infoText}>
              All health data is encrypted both in transit and at rest using industry-standard encryption.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="person" size={24} color="#4c669f" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>You Own Your Data</Text>
            <Text style={styles.infoText}>
              You can export or delete your data at any time. We never share your data with third parties.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="eye-off" size={24} color="#4c669f" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Anonymous by Default</Text>
            <Text style={styles.infoText}>
              Device identifiers are anonymized and timestamps are rounded to protect your privacy.
            </Text>
          </View>
        </View>

        <View style={styles.agreements}>
          <View style={styles.agreement}>
            <Switch
              value={acceptedTerms}
              onValueChange={setAcceptedTerms}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={acceptedTerms ? '#4c669f' : '#f4f3f4'}
            />
            <Text style={styles.agreementText}>
              I accept the Terms of Service
            </Text>
          </View>

          <View style={styles.agreement}>
            <Switch
              value={acceptedPrivacy}
              onValueChange={setAcceptedPrivacy}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={acceptedPrivacy ? '#4c669f' : '#f4f3f4'}
            />
            <Text style={styles.agreementText}>
              I accept the Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canProceed && styles.buttonDisabled]}
          onPress={onNext}
          disabled={!canProceed}
        >
          <Text style={[styles.buttonText, !canProceed && styles.buttonTextDisabled]}>
            Continue
          </Text>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  agreements: {
    marginTop: 30,
    marginBottom: 20,
  },
  agreement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  agreementText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#4c669f',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});