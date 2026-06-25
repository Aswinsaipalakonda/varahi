import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OtpVerifyPage() {
  const { phone } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setError('');

    // On success: route to PIN setup
    router.push('/set-pin');
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60);
      setError('');
      setCode('');
      // Trigger OTP resend
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.header}>
            <Text style={styles.title}>Enter Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit verification code to <Text style={styles.phoneHighlight}>+91 {phone}</Text>.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.formCard}>
            <Text style={styles.label}>Verification Code</Text>
            
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={() => inputRef.current?.focus()}
              style={styles.otpGrid}
            >
              {Array.from({ length: 6 }).map((_, idx) => {
                const char = code[idx] || '';
                return (
                  <View key={idx} style={[styles.otpBox, char ? styles.otpBoxFilled : null]}>
                    <Text style={styles.otpText}>{char}</Text>
                  </View>
                );
              })}
            </TouchableOpacity>

            <TextInput 
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(text) => {
                setCode(text.replace(/[^0-9]/g, ''));
                if (error) setError('');
              }}
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <View style={styles.resendContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend code in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Resend Verification Code</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity 
              style={styles.pillButton}
              onPress={handleVerify}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Verify & Continue</Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  formCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
    textAlign: 'center',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    borderColor: '#2563EB',
  },
  otpText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 12,
  },
  resendContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  timerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
  },
  pillButton: {
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
