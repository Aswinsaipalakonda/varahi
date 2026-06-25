import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, CreditCard, LogOut, CheckCircle, AlertTriangle, UploadCloud } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [kycVerified, setKycVerified] = useState(false);
  const [panCard, setPanCard] = useState('');
  const [aadhaarCard, setAadhaarCard] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(true);

  const handleSaveBank = () => {
    if (!bankName || !accountNumber || !ifsc) {
      Alert.alert('Missing Info', 'Please fill all bank details.');
      return;
    }
    Alert.alert('Success', 'Bank details saved successfully.');
  };

  const handleUploadKyc = () => {
    if (!panCard || !aadhaarCard) {
      Alert.alert('Missing Info', 'Please enter your PAN and Aadhaar numbers.');
      return;
    }
    if (panCard.length !== 10) {
      Alert.alert('Invalid PAN', 'PAN must be a 10-character alphanumeric ID.');
      return;
    }
    if (aadhaarCard.length !== 12) {
      Alert.alert('Invalid Aadhaar', 'Aadhaar must be a 12-digit number.');
      return;
    }
    setKycVerified(true);
    Alert.alert('KYC Submitted', 'Documents submitted successfully and are under review.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => router.replace('/login') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.userCard}>
          <View style={styles.avatar}>
            <User size={32} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.userName}>Ramesh Kumar</Text>
            <Text style={styles.userPhone}>+91 98765 43210</Text>
          </View>
          <View style={[styles.kycStatusBadge, kycVerified ? styles.kycActive : styles.kycPending]}>
            <Text style={[styles.kycStatusText, kycVerified ? styles.kycActiveText : styles.kycPendingText]}>
              {kycVerified ? 'KYC Verified' : 'KYC Pending'}
            </Text>
          </View>
        </Animated.View>

        {/* KYC Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.sectionCard}>
          <View style={styles.sectionHeaderContainer}>
            <Shield size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>KYC Verification</Text>
          </View>

          {kycVerified ? (
            <View style={styles.verifiedRow}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.verifiedText}>Your identity document verification is complete.</Text>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PAN Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ABCDE1234F"
                  value={panCard}
                  onChangeText={(t) => setPanCard(t.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Aadhaar Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0000 0000 0000"
                  value={aadhaarCard}
                  onChangeText={(t) => setAadhaarCard(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={12}
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleUploadKyc}>
                <UploadCloud size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Submit KYC Documents</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Bank Account Section */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.sectionCard}>
          <View style={styles.sectionHeaderContainer}>
            <CreditCard size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Linked Bank Account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. HDFC Bank"
                value={bankName}
                onChangeText={setBankName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 50100293849102"
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={(t) => setAccountNumber(t.replace(/[^0-9]/g, ''))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IFSC Code</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. HDFC0001234"
                value={ifsc}
                onChangeText={(t) => setIfsc(t.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleSaveBank}>
              <Text style={styles.secondaryBtnText}>Save Account Details</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Security / Preferences */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.sectionCard}>
          <View style={styles.prefRow}>
            <View>
              <Text style={styles.prefTitle}>Enable Biometric Lock</Text>
              <Text style={styles.prefSub}>Require fingerprint/Face ID to open app</Text>
            </View>
            <Switch
              value={isBiometricsEnabled}
              onValueChange={setIsBiometricsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={isBiometricsEnabled ? '#2563EB' : '#F1F5F9'}
            />
          </View>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInUp.delay(450).duration(600)}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  kycStatusBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  kycPending: {
    backgroundColor: '#FFF8E1',
  },
  kycPendingText: {
    color: '#F57F17',
  },
  kycActive: {
    backgroundColor: '#E8F5E9',
  },
  kycActiveText: {
    color: '#2E7D32',
  },
  kycStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtnText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '500',
    flex: 1,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  prefSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
