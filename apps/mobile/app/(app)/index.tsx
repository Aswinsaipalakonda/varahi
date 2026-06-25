import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, TrendingUp, Calendar, ArrowUpRight, Bell, Eye, EyeOff, Menu, Layers, DollarSign, ArrowRightLeft } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function HomeDashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Menu size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello, Ramesh 👋</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Bell size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Total Balance Blue Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              {showBalance ? <Eye size={20} color="#FFFFFF" /> : <EyeOff size={20} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceValue}>
            {showBalance ? '₹ 1,42,800' : '••••••'}
          </Text>
        </Animated.View>

        {/* 2x2 Grid Stats */}
        <View style={styles.grid}>
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.gridCard}>
            <View style={[styles.gridIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Layers size={18} color="#2E7D32" />
            </View>
            <Text style={styles.gridLabel}>Total Investment</Text>
            <Text style={styles.gridValue}>₹ 1,00,000</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(250).duration(600)} style={styles.gridCard}>
            <View style={[styles.gridIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <TrendingUp size={18} color="#1565C0" />
            </View>
            <Text style={styles.gridLabel}>Total Earnings</Text>
            <Text style={styles.gridValue}>₹ 42,800</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.gridCard}>
            <View style={[styles.gridIconContainer, { backgroundColor: '#FFF8E1' }]}>
              <Wallet size={18} color="#F57F17" />
            </View>
            <Text style={styles.gridLabel}>Available Balance</Text>
            <Text style={styles.gridValue}>₹ 5,600</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(350).duration(600)} style={styles.gridCard}>
            <View style={[styles.gridIconContainer, { backgroundColor: '#F3E5F5' }]}>
              <ArrowRightLeft size={18} color="#7B1FA2" />
            </View>
            <Text style={styles.gridLabel}>Withdrawable</Text>
            <Text style={styles.gridValue}>₹ 5,600</Text>
          </Animated.View>
        </View>

        {/* Next Payout Section */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Next Payout</Text>
          <Text style={styles.payoutDate}>15 May 2025</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(800)} style={styles.payoutDetailCard}>
          <View style={styles.payoutStat}>
            <Text style={styles.payoutStatLabel}>Expected Amount</Text>
            <Text style={styles.payoutStatValue}>₹ 5,670</Text>
          </View>
          <View style={styles.payoutDivider} />
          <View style={styles.payoutStat}>
            <Text style={styles.payoutStatLabel}>After TDS (10%)</Text>
            <Text style={[styles.payoutStatValue, { color: '#059669' }]}>₹ 5,103</Text>
          </View>
        </Animated.View>

        {/* New Investment Button */}
        <Animated.View entering={FadeInUp.delay(500).duration(800)}>
          <TouchableOpacity 
            style={styles.newInvestmentBtn}
            onPress={() => router.push('/invest-now')}
          >
            <Text style={styles.newInvestmentBtnText}>+ New Investment</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    color: '#E0F2FE',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  gridCard: {
    width: (Dimensions.get('window').width - 56) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  gridIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  payoutDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  payoutDetailCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  payoutStat: {
    flex: 1,
    alignItems: 'center',
  },
  payoutStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  payoutStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  payoutDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  newInvestmentBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 9999,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  newInvestmentBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
