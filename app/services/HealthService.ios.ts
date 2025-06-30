// services/HealthService.ios.ts
import {
    isHealthDataAvailable,
    useHealthkitAuthorization,
    useMostRecentQuantitySample,
    AuthorizationRequestStatus as HKAuthorizationRequestStatus,
    getMostRecentQuantitySample,
  } from '@kingstinct/react-native-healthkit';
  import type { QuantitySample as HKQuantitySample } from '@kingstinct/react-native-healthkit';
  import { HealthServiceHook, HealthData, QuantitySample, AuthorizationRequestStatus } from './HealthServices.types';
  
  // Helper function to convert HK sample to our generic format
  const convertSample = (sample: HKQuantitySample | undefined): QuantitySample | undefined => {
    if (!sample) return undefined;
    
    return {
      uuid: sample.uuid,
      device: sample.device,
      quantityType: sample.quantityType,
      startDate: sample.startDate,
      endDate: sample.endDate,
      quantity: sample.quantity,
      unit: sample.unit,
      metadata: sample.metadata,
      sourceRevision: sample.sourceRevision,
    };
  };
  
  export const useHealthService = (): HealthServiceHook => {
    const isAvailable = isHealthDataAvailable();
    
    const [authStatus, requestAuth] = useHealthkitAuthorization(
      ['HKQuantityTypeIdentifierStepCount', 'HKQuantityTypeIdentifierHeartRate'], // read
      ['HKQuantityTypeIdentifierStepCount'] // write steps only
    );
  
    const stepDataRaw = useMostRecentQuantitySample('HKQuantityTypeIdentifierStepCount');
    const heartRateDataRaw = useMostRecentQuantitySample('HKQuantityTypeIdentifierHeartRate');
  
    // Convert to our generic format
    const stepData = convertSample(stepDataRaw);
    const heartRateData = convertSample(heartRateDataRaw);
  
    const getMostRecentData = async (): Promise<HealthData> => {
      try {
        const stepsRaw = await getMostRecentQuantitySample('HKQuantityTypeIdentifierStepCount');
        const heartRateRaw = await getMostRecentQuantitySample('HKQuantityTypeIdentifierHeartRate');
        
        return { 
          steps: convertSample(stepsRaw), 
          heartRate: convertSample(heartRateRaw) 
        };
      } catch (error) {
        console.error('Error fetching health data:', error);
        return { steps: undefined, heartRate: undefined };
      }
    };
  
    return {
      isAvailable,
      authStatus: authStatus ?? AuthorizationRequestStatus.unknown,
      requestAuth,
      stepData,
      heartRateData,
      getMostRecentData,
      AuthorizationRequestStatus // Our enum that matches HealthKit's
    };
  };