import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { calculateMaturityValue } from '@packages/utils';

const API_URL = 'http://localhost:8000/api/v1';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [calcResults, setCalcResults] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const res = await fetch(`${API_URL}/plans/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
        setAmount(parseFloat(data.min_amount).toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plan && amount) {
      const amtVal = parseFloat(amount);
      if (!isNaN(amtVal)) {
        const res = calculateMaturityValue(amtVal, parseFloat(plan.return_rate_percent), plan.tenure_months, plan.payout_frequency);
        setCalcResults(res);
      } else {
        setCalcResults(null);
      }
    }
  }, [amount, plan]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const handleInvest = () => {
    const amtVal = parseFloat(amount);
    if (isNaN(amtVal) || amtVal < parseFloat(plan.min_amount) || amtVal > parseFloat(plan.max_amount)) {
      alert(`Amount must be between ₹${parseFloat(plan.min_amount).toLocaleString()} and ₹${parseFloat(plan.max_amount).toLocaleString()}`);
      return;
    }
    router.push({
      pathname: '/(app)/plans/invest',
      params: { planId: plan.id, amount }
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{plan.name}</Text>
        <Text style={styles.rate}>{plan.return_rate_percent}% p.a. Return Rate</Text>
      </View>

      <Text style={styles.desc}>{plan.description}</Text>

      <View style={styles.metaBox}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Payout Frequency</Text>
          <Text style={styles.metaValue}>{plan.payout_frequency.replace('_', ' ')}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Tenure</Text>
          <Text style={styles.metaValue}>{plan.tenure_months} Months</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Minimum Deposit</Text>
          <Text style={styles.metaValue}>₹{parseFloat(plan.min_amount).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.calcBox}>
        <Text style={styles.calcTitle}>Yield Calculator</Text>
        <Text style={styles.inputLabel}>Enter Investment Amount (₹)</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {calcResults && (
          <View style={styles.results}>
            <View style={styles.resRow}>
              <Text style={styles.resLabel}>Expected Period Payout:</Text>
              <Text style={styles.resValue}>₹{calcResults.periodPayout.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.resRow}>
              <Text style={styles.resLabel}>Total Yield Gain:</Text>
              <Text style={styles.resValue}>₹{calcResults.totalReturns.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.resRow}>
              <Text style={styles.resLabel}>Total Maturity Payout:</Text>
              <Text style={styles.resValue}>₹{calcResults.totalPayout.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleInvest}>
        <Text style={styles.buttonText}>Proceed to Invest</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0915',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#0A0915',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  rate: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: 'bold',
    marginTop: 6,
  },
  desc: {
    fontSize: 12,
    color: '#9E9EAF',
    lineHeight: 18,
    marginBottom: 24,
  },
  metaBox: {
    backgroundColor: '#151428',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  metaLabel: {
    color: '#9E9EAF',
    fontSize: 12,
  },
  metaValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  calcBox: {
    backgroundColor: '#151428',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  calcTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  inputLabel: {
    color: '#9E9EAF',
    fontSize: 11,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0A0915',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  results: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  resRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resLabel: {
    color: '#9E9EAF',
    fontSize: 11,
  },
  resValue: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 28,
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
