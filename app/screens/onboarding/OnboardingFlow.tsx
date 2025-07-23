import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WelcomeScreen from './Welcome';
import PrivacyScreen from './Privacy';
import LoginScreen from './Login';
import SignUpScreen from './SignUp';
import HealthPermissionsScreen from './HealthPermissions';
import CompleteScreen from './Complete';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'privacy' | 'login' | 'signup' | 'permissions' | 'complete';

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');

  const goToNextStep = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('privacy');
        break;
      case 'privacy':
        setCurrentStep('login'); // Default to login for returning users
        break;
      case 'login':
      case 'signup':
        setCurrentStep('permissions');
        break;
      case 'permissions':
        setCurrentStep('complete');
        break;
      case 'complete':
        onComplete();
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'privacy':
        setCurrentStep('welcome');
        break;
      case 'login':
        setCurrentStep('privacy');
        break;
      case 'signup':
        setCurrentStep('privacy');
        break;
      case 'permissions':
        setCurrentStep('login');
        break;
      // No back button on welcome and complete screens
    }
  };

  const switchToLogin = () => {
    setCurrentStep('login');
  };

  const switchToSignUp = () => {
    setCurrentStep('signup');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onNext={goToNextStep} />;
      case 'privacy':
        return <PrivacyScreen onNext={goToNextStep} onBack={goToPreviousStep} />;
      case 'login':
        return <LoginScreen onNext={goToNextStep} onBack={goToPreviousStep} onSwitchToSignUp={switchToSignUp} />;
      case 'signup':
        return <SignUpScreen onNext={goToNextStep} onBack={goToPreviousStep} onSwitchToLogin={switchToLogin} />;
      case 'permissions':
        return <HealthPermissionsScreen onNext={goToNextStep} onBack={goToPreviousStep} />;
      case 'complete':
        return <CompleteScreen onComplete={onComplete} />;
      default:
        return <WelcomeScreen onNext={goToNextStep} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});