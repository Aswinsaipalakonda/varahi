import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function MyInvestmentsScreen() {
  const [activeTab, setActiveTab] = useState<'Active' | 'Completed' | 'Cancelled'>('Active');

  const activeInvestments = [
    {
      id: 'INV10023',
      investedAmount: '1,00,000',
      investDate: '01 May 2025',
      dailyReturn: '700',
      nextPayout: '15 May 2025',
      totalEarnings: '2,800',
      payoutEvery: '15 Days',
    },
    {
      id: 'INV10015',
      investedAmount: '1,00,000',
      investDate: '16 Apr 2025',
      dailyReturn: '700',
      nextPayout: '30 Apr 2025',
      totalEarnings: '4,200',
      payoutEvery: '15 Days',
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Investments</Text>
      </View>

      {/* Custom Tab Switcher */}
      <View style={styles.tabContainer}>
        {['Active', 'Completed', 'Cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Active' ? (
          activeInvestments.map((inv, index) => (
            <Animated.View 
              entering={FadeInUp.delay(index * 100).duration(500)} 
              key={inv.id} 
              style={styles.invCard}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardId}>{inv.id}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Active</Text>
                </View>
              </View>

              {/* Card Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Invested Amount</Text>
                  <Text style={styles.cellValue}>₹ {inv.investedAmount}</Text>
                </View>
                
                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Invest Date</Text>
                  <Text style={styles.cellValue}>{inv.investDate}</Text>
                </View>
                
                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Daily Return</Text>
                  <Text style={styles.cellValue}>₹ {inv.dailyReturn} (0.7%)</Text>
                </View>
                
                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Next Payout</Text>
                  <Text style={styles.cellValue}>{inv.nextPayout}</Text>
                </View>
                
                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Total Earnings</Text>
                  <Text style={[styles.cellValue, { color: '#2563EB' }]}>₹ {inv.totalEarnings}</Text>
                </View>
                
                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Payout Every</Text>
                  <Text style={styles.cellValue}>{inv.payoutEvery}</Text>
                </View>
              </View>

              {/* Bottom Action */}
              <TouchableOpacity style={styles.detailsBtn}>
                <Text style={styles.detailsBtnText}>View Details</Text>
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No investments found in {activeTab}</Text>
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#2563EB',
  },
  scrollContent: {
    padding: 20,
  },
  invCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 16,
  },
  cardId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
    marginBottom: 20,
  },
  gridCell: {
    width: '50%',
  },
  cellLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailsBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
});
