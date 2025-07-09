import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Health Data",
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: "Health Dashboard",
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
