import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function InvestNowScreen() {
  const [amount, setAmount] = useState('1,00,000');
  const router = useRouter();

  // Helper to strip non-numeric and parse
  const getNumericValue = (val: string) => {
    return parseFloat(val.replace(/,/g, '')) || 0;
  };

  const numericAmount = getNumericValue(amount);
  const spotDividend = numericAmount * 0.03;
  const bonus = numericAmount * 0.05;

  // Format currency helper
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleQuickSelect = (value: number) => {
    setAmount(formatCurrency(value));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invest Now</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Select Investment Plan */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Select Investment Plan</Text>
          <View style={styles.planDetailsCard}>
            <Text style={styles.planName}>Daily Plan</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Daily Return</Text>
              <Text style={styles.detailValue}>₹ {formatCurrency(numericAmount * 0.007)} (0.7%)</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payout Every</Text>
              <Text style={styles.detailValue}>15 Days</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trading Holidays</Text>
              <Text style={styles.detailValue}>Saturday & Sunday</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TDS</Text>
              <Text style={styles.detailValue}>10% on Payout</Text>
            </View>
          </View>
        </Animated.View>

        {/* Enter Investment Amount */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Enter Investment Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, '');
                if (clean) {
                  setAmount(formatCurrency(parseInt(clean)));
                } else {
                  setAmount('');
                }
              }}
              keyboardType="number-pad"
            />
          </View>

          {/* Quick Select Chips */}
          <View style={styles.chipsContainer}>
            <TouchableOpacity style={styles.chip} onPress={() => handleQuickSelect(100000)}>
              <Text style={styles.chipText}>₹ 1 Lakh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => handleQuickSelect(200000)}>
              <Text style={styles.chipText}>₹ 2 Lakhs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => handleQuickSelect(500000)}>
              <Text style={styles.chipText}>₹ 5 Lakhs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => handleQuickSelect(1000000)}>
              <Text style={styles.chipText}>₹ 10 Lakhs</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* You will get breakdown */}
        {numericAmount > 0 && (
          <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.benefitsCard}>
            <Text style={styles.benefitsHeader}>You will get</Text>

            <View style={styles.benefitRow}>
              <View style={styles.benefitTextContainer}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.benefitLabel}>Instant 3% Spot Dividend</Text>
              </View>
              <Text style={styles.benefitValue}>₹ {formatCurrency(spotDividend)}</Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.benefitTextContainer}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.benefitLabel}>5% Bonus (Upto 5 Lakhs)</Text>
              </View>
              <Text style={styles.benefitValue}>₹ {formatCurrency(bonus)}</Text>
            </View>
          </Animated.View>
        )}

        {/* Proceed Button */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.btnContainer}>
          <TouchableOpacity 
            style={styles.proceedBtn}
            onPress={() => router.push({
              pathname: '/make-payment',
              params: { amount: amount }
            })}
          >
            <Text style={styles.proceedBtnText}>Proceed to Pay</Text>
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
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 16,
  },
  planDetailsCard: {
    gap: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    paddingVertical: 8,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    padding: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  benefitsCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 24,
  },
  benefitsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitLabel: {
    fontSize: 14,
    color: '#065F46',
  },
  benefitValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  btnContainer: {
    marginBottom: 20,
  },
  proceedBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 9999,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
