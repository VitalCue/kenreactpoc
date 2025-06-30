import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { isHealthDataAvailable,
  useHealthkitAuthorization,
  useMostRecentQuantitySample,
  AuthorizationRequestStatus,
  getMostRecentQuantitySample,
  QuantitySample
 } from '@kingstinct/react-native-healthkit';

export default function Index() {
  const isAvailable = isHealthDataAvailable();
  console.log("Health Data is being read", isAvailable);
  //utilizing hooks instead of imperative api, as there is built in stage management
  // Read-only permissions

  const [authStatus, requestAuth] = useHealthkitAuthorization(
    ['HKQuantityTypeIdentifierStepCount', 'HKQuantityTypeIdentifierHeartRate'], //read
    ['HKQuantityTypeIdentifierStepCount'] //write steps only
  );

  //get the most recent data (only works after authorization) 
  const stepData = useMostRecentQuantitySample('HKQuantityTypeIdentifierStepCount');
  const heartRateData = useMostRecentQuantitySample('HKQuantityTypeIdentifierHeartRate');
  
  const [manualStepData, setManualStepData] = useState<QuantitySample | undefined>(undefined);
  const [manualHeartRateData, setManualHeartRateData] = useState<QuantitySample | undefined>(undefined);

  const refetchData = async () => {
    const steps = await getMostRecentQuantitySample('HKQuantityTypeIdentifierStepCount');
    const heartRate = await getMostRecentQuantitySample('HKQuantityTypeIdentifierHeartRate');
    setManualStepData(steps);
    setManualHeartRateData(heartRate);
  };

  useEffect(() => {
    if (authStatus === AuthorizationRequestStatus.unnecessary) {
      console.log("Permissions granted, refetching data");
      refetchData();
    }
  }, [authStatus]);

  const requestPermissions = async () => {
    const status = await requestAuth();
    console.log("Authorization status:", status);
    console.log("Step Data:", stepData);
    console.log("Heart Rate Data:", heartRateData);

  };

  
  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Health Data Access version 3</Text>
      <Text style={Styles.status}>Authorization Status: {authStatus}</Text>
      <Text style={Styles.dataDisplay}>
        Step Count: {manualStepData?.quantity || stepData?.quantity}
      </Text>
      <Text style={Styles.dataDisplay}>
        Heart Rate: {manualHeartRateData?.quantity || heartRateData?.quantity}
      </Text>
      <TouchableOpacity style={Styles.button} onPress={requestPermissions}>
        <Text style={Styles.buttonText}>Request Permissions</Text>
      </TouchableOpacity>
    </View>
  );
}


const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "bold",
  },
  dataDisplay: {
    fontSize: 16,
    marginTop: 20,
    color: '#333',
  }
});