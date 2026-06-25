import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function EarningsScreen() {
  const earnings = [
    { id: 'TXN89127', amount: '5,103', date: '15 May 2025', desc: 'Yield Payout (INV10023)' },
    { id: 'TXN87612', amount: '5,103', date: '30 Apr 2025', desc: 'Yield Payout (INV10015)' },
    { id: 'TXN85190', amount: '3,000', date: '16 Apr 2025', desc: 'Spot Dividend (INV10015)' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings & Payouts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Paid Earnings</Text>
              <Text style={styles.summaryValue}>₹ 13,206</Text>
            </View>
            <View style={styles.iconContainer}>
              <TrendingUp size={24} color="#059669" />
            </View>
          </View>
        </Animated.View>

        <Text style={styles.sectionTitle}>Payout History</Text>

        {earnings.map((item, index) => (
          <Animated.View 
            entering={FadeInUp.delay(200 + index * 100).duration(600)} 
            key={item.id} 
            style={styles.historyCard}
          >
            <View style={styles.historyHeader}>
              <View style={styles.calendarRow}>
                <Calendar size={14} color="#64748B" />
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
              <Text style={styles.historyId}>{item.id}</Text>
            </View>
            
            <View style={styles.historyBody}>
              <View>
                <Text style={styles.historyDesc}>{item.desc}</Text>
                <Text style={styles.historySub}>TDS Deducted & Credited</Text>
              </View>
              <Text style={styles.historyAmount}>+ ₹ {item.amount}</Text>
            </View>
          </Animated.View>
        ))}
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
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  historyId: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  historyBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  historySub: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
});
