import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:8000/api/v1';

export default function InvestAmountScreen() {
  const { planId, amount } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleProceed = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const res = await fetch(`${API_URL}/investments/initiate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: planId,
          amount: parseFloat(amount as string)
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push({
          pathname: '/(app)/payment/upi-redirect',
          params: {
            txnRef: data.txn_ref,
            amount: data.amount,
            upiId: data.upi_id,
            payeeName: data.payee_name
          }
        });
      } else {
        alert('Failed to initiate investment.');
      }
    } catch (err) {
      alert('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Investment</Text>
        <Text style={styles.subtitle}>Review your deposit value before proceeding</Text>
      </View>

      <View style={styles.confirmBox}>
        <Text style={styles.label}>Total Deposit Value</Text>
        <Text style={styles.value}>₹{parseFloat(amount as string).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>

      <Text style={styles.infoText}>
        On the next step, you will be redirected to choose a UPI payment app (such as Google Pay, PhonePe, or Paytm) to make the transfer. 
        Once paid, you must return to the app to upload the screenshot showing the successful transaction reference number.
      </Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleProceed}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Proceed to Payment</Text>
        )}
      </TouchableOpacity>
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
  confirmBox: {
    backgroundColor: '#151428',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  label: {
    color: '#9E9EAF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  value: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoText: {
    color: '#9E9EAF',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
