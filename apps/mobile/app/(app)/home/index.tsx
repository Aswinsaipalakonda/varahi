import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:8000/api/v1';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const [profileRes, invRes] = await Promise.all([
        fetch(`${API_URL}/auth/me/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/investments/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (profileRes.ok && invRes.ok) {
        const profileData = await profileRes.json();
        const invData = await invRes.json();
        setProfile(profileData);
        setInvestments(invData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalInvested = activeInvestments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome Back,</Text>
        <Text style={styles.name}>{profile?.full_name || 'Retail Investor'}</Text>
      </View>

      <View style={styles.portfolioCard}>
        <Text style={styles.portfolioLabel}>Total Invested Value</Text>
        <Text style={styles.portfolioValue}>₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{activeInvestments.length} Active Plans</Text>
          <Text style={styles.walletText}>Wallet Balance: ₹{parseFloat(profile?.wallet_balance || 0).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/plans/index')}>
          <Text style={styles.actionIcon}>📈</Text>
          <Text style={styles.actionText}>Invest Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/payouts/index')}>
          <Text style={styles.actionIcon}>💸</Text>
          <Text style={styles.actionText}>Withdrawal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/portfolio/index')}>
          <Text style={styles.actionIcon}>💼</Text>
          <Text style={styles.actionText}>My Portfolio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/referral/index')}>
          <Text style={styles.actionIcon}>🤝</Text>
          <Text style={styles.actionText}>Refer & Earn</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Active Investments</Text>
      {activeInvestments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active investments found.</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/(app)/plans/index')}
          >
            <Text style={styles.emptyButtonText}>View Investment Plans</Text>
          </TouchableOpacity>
        </View>
      ) : (
        activeInvestments.map((inv) => (
          <View key={inv.id} style={styles.invCard}>
            <View style={styles.invHeader}>
              <Text style={styles.invPlanName}>{inv.plan_details.name}</Text>
              <Text style={styles.invAmount}>₹{parseFloat(inv.amount).toLocaleString('en-IN')}</Text>
            </View>
            <Text style={styles.invMeta}>Tenure: {inv.plan_details.tenure_months} Months • Yield: {inv.plan_details.return_rate_percent}% p.a.</Text>
          </View>
        ))
      )}
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#9E9EAF',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  portfolioCard: {
    backgroundColor: '#151428',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  portfolioLabel: {
    color: '#9E9EAF',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  portfolioValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 14,
  },
  statsText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  walletText: {
    color: '#9E9EAF',
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#151428',
    borderRadius: 28,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 32,
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: '#151428',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9E9EAF',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#2563EB',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 14,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  invCard: {
    backgroundColor: '#151428',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  invHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invPlanName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  invAmount: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 'bold',
  },
  invMeta: {
    color: '#9E9EAF',
    fontSize: 11,
    marginTop: 6,
  },
});
