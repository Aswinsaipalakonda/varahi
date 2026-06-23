import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { buildUPIDeepLink } from '@packages/utils';

export default function UpiRedirectScreen() {
  const { txnRef, amount, upiId, payeeName } = useLocalSearchParams();
  const router = useRouter();

  const handlePayNow = () => {
    const link = buildUPIDeepLink({
      upiId: upiId as string,
      payeeName: payeeName as string,
      amount: parseFloat(amount as string),
      txnRef: txnRef as string
    });

    Linking.openURL(link).catch(() => {
      alert('Could not launch UPI app. Please copy details and pay manually.');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Redirecting to UPI</Text>
        <Text style={styles.subtitle}>Execute transfer securely using any UPI app</Text>
      </View>

      <View style={styles.detailsBox}>
        <Text style={styles.label}>Merchant UPI ID</Text>
        <Text style={styles.value}>{upiId}</Text>

        <Text style={styles.label}>Payee Name</Text>
        <Text style={styles.value}>{payeeName}</Text>

        <Text style={styles.label}>Amount to Transfer</Text>
        <Text style={styles.value}>₹{parseFloat(amount as string).toLocaleString('en-IN')}</Text>

        <Text style={styles.label}>Transaction Reference</Text>
        <Text style={styles.ref}>{txnRef}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
          <Text style={styles.payButtonText}>Open UPI Banking App</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => router.push({
            pathname: '/(app)/payment/screenshot-upload',
            params: { txnRef }
          })}
        >
          <Text style={styles.uploadButtonText}>I Have Paid. Upload Screenshot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0915',
    padding: 20,
    paddingTop: 50,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#9E9EAF',
    marginTop: 4,
  },
  detailsBox: {
    backgroundColor: '#151428',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  label: {
    color: '#9E9EAF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 12,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  ref: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  payButton: {
    backgroundColor: '#2563EB',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
