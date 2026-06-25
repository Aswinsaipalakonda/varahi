import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, Check, UploadCloud, CreditCard, Landmark, CheckCircle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function MakePaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const amount = (Array.isArray(params.amount) ? params.amount[0] : params.amount) || '1,00,000';

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const upiId = 'varahiland@upi';
  const accountName = 'Varahi Land Developers';
  const bankName = 'HDFC Bank';
  const accountNumber = '1234 5678 9012 34';
  const ifscCode = 'HDFC0001234';

  const copyToClipboard = async (text: string, fieldName: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePayNow = () => {
    // Standard UPI deep link format
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountName)}&am=${amount.replace(/,/g, '')}&cu=INR&tn=Investment`;
    
    Linking.canOpenURL(upiUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(upiUrl);
        } else {
          alert('No UPI apps found on this device. Please copy the UPI ID and pay manually.');
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const handleSubmit = () => {
    if (!utr || utr.trim().length < 8) {
      alert('Please enter a valid 12-digit UTR or Transaction ID.');
      return;
    }
    setIsSubmitting(true);
    // Simulate API upload
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={64} color="#10B981" />
          <Text style={styles.successTitle}>Receipt Submitted</Text>
          <Text style={styles.successSubtitle}>
            Your transaction ID ({utr}) is being verified. Your investment status will update shortly.
          </Text>
          <TouchableOpacity 
            style={styles.doneBtn} 
            onPress={() => router.replace('/(app)')}
          >
            <Text style={styles.doneBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Info */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.banner}>
          <Text style={styles.bannerText}>Complete payment using any of the options below</Text>
        </Animated.View>

        {/* UPI Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.paymentCard}>
          <Text style={styles.paymentCardHeader}>UPI Payment (Recommended)</Text>
          <Text style={styles.paymentCardSub}>Pay using UPI App</Text>

          <View style={styles.upiDisplayRow}>
            <Text style={styles.upiIdText}>{upiId}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(upiId, 'upi')} style={styles.copyBtn}>
              {copiedField === 'upi' ? <Check size={16} color="#059669" /> : <Copy size={16} color="#64748B" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.payNowBtn} onPress={handlePayNow}>
            <Text style={styles.payNowBtnText}>Pay Now</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bank Transfer Section */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.paymentCard}>
          <Text style={styles.paymentCardHeader}>Other Options</Text>
          
          <View style={styles.bankDetailRow}>
            <View>
              <Text style={styles.bankLabel}>Account Name</Text>
              <Text style={styles.bankValue}>{accountName}</Text>
            </View>
          </View>

          <View style={styles.bankDetailRow}>
            <View>
              <Text style={styles.bankLabel}>Bank Name</Text>
              <Text style={styles.bankValue}>{bankName}</Text>
            </View>
          </View>

          <View style={styles.bankDetailRow}>
            <View>
              <Text style={styles.bankLabel}>Account Number</Text>
              <Text style={styles.bankValue}>{accountNumber}</Text>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(accountNumber.replace(/\s/g, ''), 'acc')} style={styles.copyBtn}>
              {copiedField === 'acc' ? <Check size={16} color="#059669" /> : <Copy size={16} color="#64748B" />}
            </TouchableOpacity>
          </View>

          <View style={styles.bankDetailRow}>
            <View>
              <Text style={styles.bankLabel}>IFSC Code</Text>
              <Text style={styles.bankValue}>{ifscCode}</Text>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(ifscCode, 'ifsc')} style={styles.copyBtn}>
              {copiedField === 'ifsc' ? <Check size={16} color="#059669" /> : <Copy size={16} color="#64748B" />}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* UTR Input confirmation */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.utrCard}>
          <Text style={styles.utrLabel}>Confirm Your Investment</Text>
          <Text style={styles.utrSub}>After payment, enter UTR / Transaction ID to confirm your investment.</Text>
          
          <TextInput
            style={styles.utrInput}
            placeholder="Enter 12-digit UTR / TXN ID"
            value={utr}
            onChangeText={setUtr}
            keyboardType="number-pad"
          />

          <TouchableOpacity 
            style={[styles.submitBtn, (!utr || isSubmitting) && styles.disabledBtn]} 
            onPress={handleSubmit}
            disabled={!utr || isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Verifying...' : 'Submit Reference'}
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  banner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  paymentCardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  paymentCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  upiDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  upiIdText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  copyBtn: {
    padding: 6,
  },
  payNowBtn: {
    backgroundColor: '#10B981',
    borderRadius: 9999,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payNowBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bankLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  bankValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  utrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 40,
  },
  utrLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  utrSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  utrInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 9999,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledBtn: {
    backgroundColor: '#94A3B8',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
