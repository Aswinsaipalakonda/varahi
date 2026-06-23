import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="set-pin" />
      <Stack.Screen name="biometric-setup" />
    </Stack>
  );
}
