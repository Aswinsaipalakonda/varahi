import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:8000/api/v1';

export default function PortfolioScreen() {
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const res = await fetch(`${API_URL}/investments/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvestments(data);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to retrieve portfolio data.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async (investmentId: string, planName: string, penaltyPercent: number) => {
    Alert.alert(
      'Confirm Early Withdrawal',
      `Are you sure you want to prematurely withdraw your investment in "${planName}"?\n\nA premature withdrawal penalty of ${penaltyPercent}% will be applied to your principal.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Withdrawal', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('access_token');
              const res = await fetch(`${API_URL}/payouts/withdrawal-request/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ investment_id: investmentId })
              });
              const data = await res.json();
              if (res.ok) {
                Alert.alert('Withdrawal Initiated', 'Your withdrawal request was processed successfully. The final payout payout has been generated.');
                fetchInvestments();
              } else {
                Alert.alert('Error', data.error || 'Failed to request withdrawal.');
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to submit withdrawal request.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const activeCount = investments.filter(i => i.status === 'active').length;
  const pendingCount = investments.filter(i => i.status === 'pending').length;
  const activeValue = investments.filter(i => i.status === 'active').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'matured': return '#3B82F6';
      case 'rejected': return '#EF4444';
      case 'withdrawn': return '#6B7280';
      default: return '#9E9EAF';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Portfolio</Text>
        <Text style={styles.subtitle}>Track your performance and investments</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsCol}>
          <Text style={styles.statsLabel}>Total Portfolio Value</Text>
          <Text style={styles.statsValue}>₹{activeValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{activeCount} Active • {pendingCount} Pending Verification</Text>
        </View>
      </View>

      <FlatList
        data={investments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't made any investments yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.planName}>{item.plan_details?.name || 'Investment Plan'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusTextBadge, { color: getStatusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.cardDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Principal Amount</Text>
                <Text style={styles.detailValue}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Yield Rate / Tenure</Text>
                <Text style={styles.detailValue}>{item.plan_details?.return_rate_percent}% p.a. • {item.plan_details?.tenure_months}m</Text>
              </View>
              {item.start_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Maturity Date</Text>
                  <Text style={styles.detailValue}>{item.maturity_date}</Text>
                </View>
              )}
              {item.rejection_reason && (
                <View style={styles.rejectContainer}>
                  <Text style={styles.rejectLabel}>Rejection Reason:</Text>
                  <Text style={styles.rejectText}>{item.rejection_reason}</Text>
                </View>
              )}
            </View>

            {item.status === 'active' && (
              <TouchableOpacity 
                style={styles.withdrawButton}
                onPress={() => handleWithdrawalRequest(item.id, item.plan_details.name, item.plan_details.premature_penalty_percent || 0)}
              >
                <Text style={styles.withdrawButtonText}>Request Early Withdrawal</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0915',
    paddingTop: 50,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#0A0915',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
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
  statsCard: {
    backgroundColor: '#151428',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statsCol: {
    marginBottom: 12,
  },
  statsLabel: {
    color: '#9E9EAF',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statsValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  statsText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#151428',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  planName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTextBadge: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#9E9EAF',
    fontSize: 12,
  },
  detailValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  rejectLabel: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rejectText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 2,
  },
  withdrawButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  withdrawButtonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
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
});
