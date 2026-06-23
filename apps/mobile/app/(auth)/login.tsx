import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export default function LoginScreen() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!mobileNumber.startsWith('+91') || mobileNumber.length < 13) {
      setError('Number must start with +91 followed by 10 digits.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/send-otp/`, {
        mobile_number: mobileNumber
      });
      if (res.status === 200) {
        router.push({
          pathname: '/(auth)/otp-verify',
          params: { mobileNumber }
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Varahi Capital</Text>
        <Text style={styles.subtitle}>Retail Investor Authentication</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.form}>
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput 
          placeholder="+919999999999"
          placeholderTextColor="#555"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <Text style={styles.hint}>Format: +91 followed by 10 digits.</Text>

        <TouchableOpacity 
          onPress={handleSendOtp}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Request Login OTP</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#9E9EAF',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  hint: {
    color: '#555',
    fontSize: 10,
    marginTop: 6,
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
