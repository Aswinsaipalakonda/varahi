import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';


const API_URL = 'http://localhost:8000/api/v1';

export default function OtpVerifyScreen() {
  const { mobileNumber } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Enter the 6-digit OTP code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobileNumber, otp })
      });
      const data = await res.json();
      if (res.ok) {
        // Save tokens in SecureStore
        await SecureStore.setItemAsync('access_token', data.access);
        await SecureStore.setItemAsync('refresh_token', data.refresh);
        
        if (data.is_new_user) {
          router.push('/(auth)/set-pin');
        } else {
          router.replace('/(app)/home');
        }
      } else {
        setError(data.error || 'Invalid OTP code. Try again.');
      }
    } catch (err: any) {
      setError('Verification error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enter OTP Code</Text>
        <Text style={styles.subtitle}>Sent to {mobileNumber}</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.form}>
        <Text style={styles.label}>6-Digit Code</Text>
        <TextInput 
          placeholder="000000"
          placeholderTextColor="#555"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
          style={styles.input}
        />
        <Text style={styles.hint}>Demo default is 123456 for +919999999999</Text>

        <TouchableOpacity 
          onPress={handleVerify}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify & Login</Text>
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
    fontSize: 24,
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
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  hint: {
    color: '#555',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
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
