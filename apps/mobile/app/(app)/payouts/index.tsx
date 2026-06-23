import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:8000/api/v1';

export default function PayoutsScreen() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const res = await fetch(`${API_URL}/payouts/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayouts(data);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to retrieve payout schedule.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const paidPayouts = payouts.filter(p => p.status === 'paid');
  const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'overdue');
  const totalPaid = paidPayouts.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalUpcoming = pendingPayouts.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'overdue': return '#EF4444';
      case 'skipped': return '#6B7280';
      default: return '#9E9EAF';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payout Schedule</Text>
        <Text style={styles.subtitle}>Check your yield distributions and maturities</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCol}>
            <Text style={styles.sumLabel}>Received Yield</Text>
            <Text style={styles.sumValue}>₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryCol}>
            <Text style={styles.sumLabel}>Upcoming Yield</Text>
            <Text style={styles.sumValue}>₹{totalUpcoming.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={payouts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payouts scheduled yet. Payouts are generated automatically when investments are approved.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.payoutItem}>
            <View style={styles.itemHeader}>
              <View>
                <Text style={styles.planName}>{item.investment_details?.plan_name || 'Investment'}</Text>
                <Text style={styles.itemDate}>Due Date: {item.due_date}</Text>
              </View>
              <View style={styles.rightHeader}>
                <Text style={styles.itemAmount}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            {item.paid_at && (
              <Text style={styles.paidInfo}>Credited to Bank Account on {new Date(item.paid_at).toLocaleDateString('en-IN')}</Text>
            )}
            {item.remarks && (
              <Text style={styles.remarksText}>{item.remarks}</Text>
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
  summaryCard: {
    backgroundColor: '#151428',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryCol: {
    alignItems: 'center',
  },
  sumLabel: {
    color: '#9E9EAF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sumValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  payoutItem: {
    backgroundColor: '#151428',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemDate: {
    color: '#9E9EAF',
    fontSize: 11,
    marginTop: 4,
  },
  rightHeader: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemAmount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  paidInfo: {
    color: '#10B981',
    fontSize: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
  },
  remarksText: {
    color: '#9E9EAF',
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
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
    lineHeight: 18,
  },
});
