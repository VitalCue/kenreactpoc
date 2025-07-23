import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide headers for all screens by default
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
