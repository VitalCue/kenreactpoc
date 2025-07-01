import { HealthServiceHook, HealthData, QuantitySample, AuthorizationRequestStatus } from './HealthServices.types';

export const useHealthService = (): HealthServiceHook => {
  const isAvailable = false;
  const authStatus = AuthorizationRequestStatus.unknown;
  
  const requestAuth = async (): Promise<AuthorizationRequestStatus> => {
    console.log('Android health permissions not implemented yet');
    return AuthorizationRequestStatus.unknown;
  };

  const stepData: QuantitySample | undefined = undefined;
  const heartRateData: QuantitySample | undefined = undefined;

  const getMostRecentData = async (): Promise<HealthData> => {
    console.log('Android health data fetching not implemented yet');
    return { steps: undefined, heartRate: undefined };
  };

  return {
    isAvailable,
    authStatus,
    requestAuth,
    stepData,
    heartRateData,
    getMostRecentData,
    AuthorizationRequestStatus
  };
};