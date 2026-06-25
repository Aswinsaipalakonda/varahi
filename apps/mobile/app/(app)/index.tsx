import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, TrendingUp, Calendar, ArrowUpRight, Bell, Award } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function HomeDashboard() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>Aswin Sai</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <Text style={styles.mainCardLabel}>Total Portfolio Value</Text>
            <View style={styles.badge}>
              <TrendingUp size={12} color="#10B981" />
              <Text style={styles.badgeText}>+0.7% Daily</Text>
            </View>
          </View>
          <Text style={styles.mainCardValue}>₹1,25,000.00</Text>
          <View style={styles.divider} />
          <View style={styles.cardStats}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Active Yield</Text>
              <Text style={styles.statValue}>₹875.00/day</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>₹18,375.00</Text>
            </View>
          </View>
        </Animated.View>

        {/* Payout Banner */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.payoutCard}>
          <View style={styles.payoutIconContainer}>
            <Calendar size={20} color="#2563EB" />
          </View>
          <View style={styles.payoutInfo}>
            <Text style={styles.payoutLabel}>Next Estimated Payout</Text>
            <Text style={styles.payoutDate}>08 July 2026</Text>
          </View>
          <View style={styles.payoutAmountContainer}>
            <Text style={styles.payoutAmount}>₹13,125</Text>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Wallet size={20} color="#2563EB" />
            </View>
            <Text style={styles.actionText}>Invest Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Award size={20} color="#059669" />
            </View>
            <Text style={styles.actionText}>Rewards</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Updates */}
        <Text style={styles.sectionTitle}>Performance Analytics</Text>
        <View style={styles.analyticsList}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsTitle}>Varahi Capital Plan Alpha</Text>
            <Text style={styles.analyticsSubtitle}>15-day cycle • 10.5% Yield per cycle</Text>
            <Text style={styles.analyticsStatus}>Active</Text>
          </View>
        </View>
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
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  mainCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainCardLabel: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  mainCardValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    color: '#93C5FD',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  payoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  payoutDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  payoutAmountContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  analyticsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  analyticsItem: {
    gap: 4,
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  analyticsSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  analyticsStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
});
