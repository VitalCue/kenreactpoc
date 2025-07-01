import { Text, View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useEffect, useState } from "react";
import { useHealthService } from './services/HealthService.ios';
import type { HealthData } from './services/HealthServices.types';

export default function Index() {
  if (Platform.OS == "ios") {
    const {
      isAvailable,
      authStatus,
      requestAuth,
      stepData,
      heartRateData,
      getMostRecentData,
      AuthorizationRequestStatus
    } = useHealthService();
    
    console.log("Health Data is being read", isAvailable);
    
    const [manualHealthData, setManualHealthData] = useState<HealthData | undefined>(undefined);

    const refetchData = async () => {
      const data = await getMostRecentData();
      setManualHealthData(data);
    };

    console.log("Authorization Status:", authStatus);

    useEffect(() => {
      if (authStatus === AuthorizationRequestStatus.unnecessary) {
        console.log("Permissions granted, refetching data");
        console.log("Authorization Status:", authStatus);
        refetchData();
      }
    }, [authStatus]);

    const requestPermissions = async () => {
      const status = await requestAuth();
      console.log("Authorization status:", status);
      console.log("Step Data:", stepData);
      console.log("Heart Rate Data:", heartRateData);

    };
  }
  
  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Health Data Access version 3</Text>
      <Text style={Styles.status}>Authorization Status: {authStatus}</Text>
      <Text style={Styles.dataDisplay}>
        Step Count: {manualHealthData?.steps?.quantity || stepData?.quantity}
      </Text>
      <Text style={Styles.dataDisplay}>
        Heart Rate: {manualHealthData?.heartRate?.quantity || heartRateData?.quantity}
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