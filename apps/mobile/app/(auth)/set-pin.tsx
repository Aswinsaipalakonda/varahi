import { API_URL } from '../config';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function SetPinScreen() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSetPin = async () => {
    if (pin.length < 4) {
      setError('PIN must be 4 digits.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync('access_token');
      const res = await fetch(`${API_URL}/auth/set-pin/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin })
      });
      if (res.ok) {
        router.push('/(auth)/biometric-setup');
      } else {
        setError('Failed to set PIN. Try again.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Set Daily Login PIN</Text>
        <Text style={styles.subtitle}>Choose a secure 4-digit PIN</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.form}>
        <Text style={styles.label}>4-Digit PIN</Text>
        <TextInput 
          placeholder="0000"
          placeholderTextColor="#555"
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity 
          onPress={handleSetPin}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Configure PIN</Text>
          )}
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
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#9E9EAF',
    marginTop: 6,
  },
  form: {
    marginTop: 20,
  },
  label: {
    color: '#9E9EAF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#151428',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  errorText: {
    color: '#F43F5E',
    backgroundColor: 'rgba(244,63,94,0.1)',
    padding: 12,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
