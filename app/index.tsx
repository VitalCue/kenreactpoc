import React, { useState } from 'react';
import { OnboardingFlow, DashboardScreen } from './screens';
import { useAuth } from './hooks/useAuth';
import { useHealthService } from './services/health';
import { HealthDataSyncService } from './services/sync/HealthDataSyncService';

export default function Index() {
  const { user } = useAuth();
  const healthService = useHealthService();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(!!user);
  const [syncService] = useState<HealthDataSyncService | null>(
    user ? new HealthDataSyncService(user.uid, healthService) : null
  );

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <DashboardScreen syncService={syncService} />;
}

