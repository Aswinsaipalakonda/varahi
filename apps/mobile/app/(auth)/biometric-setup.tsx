import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function BiometricSetupScreen() {
  const router = useRouter();

  const handleEnable = async () => {
    await SecureStore.setItemAsync('biometric_enabled', 'true');
    router.replace('/(app)/home');
  };

  const handleSkip = () => {
    router.replace('/(app)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enable Biometrics</Text>
        <Text style={styles.subtitle}>Use Face ID / Fingerprint for fast daily access</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          onPress={handleEnable}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Enable Biometric Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0915',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#9E9EAF',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 12
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  skipButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#9E9EAF',
    fontSize: 14,
  },
});
