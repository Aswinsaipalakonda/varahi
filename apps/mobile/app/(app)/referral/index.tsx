import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:8000/api/v1';

export default function ReferralScreen() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<any>(null);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      
      const [earningsRes, codeRes] = await Promise.all([
        fetch(`${API_URL}/referrals/earnings/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/referrals/my_code/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (earningsRes.ok && codeRes.ok) {
        const earningsData = await earningsRes.json();
        const codeData = await codeRes.json();
        setEarnings(earningsData);
        setCode(codeData.referral_code);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to retrieve referral details.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!code) {
      Alert.alert('Not Available', 'Your referral code will be generated once your KYC is approved.');
      return;
    }

    try {
      await Share.share({
        message: `Join Varahi Capital using my referral code: ${code} and start earning premium yields today! Download the app now.`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Refer & Earn</Text>
        <Text style={styles.subtitle}>Invite friends and earn a bonus on their first deposit</Text>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        {code ? (
          <View style={styles.codeRow}>
            <Text style={styles.codeValue}>{code}</Text>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareText}>Share Link</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.codeUnavailable}>Pending KYC Approval</Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Invited Friends</Text>
          <Text style={styles.statValue}>{earnings?.total_referred || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Earned</Text>
          <Text style={styles.statValue}>₹{(earnings?.total_earned || 0).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Referral Rewards History</Text>
      <FlatList
        data={earnings?.bonuses || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No referral bonuses earned yet. Share your code to get started!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.bonusItem}>
            <View style={styles.bonusHeader}>
              <View>
                <Text style={styles.referredUser}>User ID: {item.referred_user_mobile || 'New Member'}</Text>
                <Text style={styles.bonusDate}>{new Date(item.created_at).toLocaleDateString('en-IN')}</Text>
              </View>
              <View style={styles.bonusRight}>
                <Text style={styles.bonusAmount}>+₹{parseFloat(item.bonus_amount).toLocaleString('en-IN')}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'credited' ? '#10B98120' : '#F59E0B20' }]}>
                  <Text style={[styles.statusText, { color: item.status === 'credited' ? '#10B981' : '#F59E0B' }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
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
  codeCard: {
    backgroundColor: '#151428',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  codeLabel: {
    color: '#9E9EAF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  codeValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  shareButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  codeUnavailable: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#151428',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statLabel: {
    color: '#9E9EAF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  bonusItem: {
    backgroundColor: '#151428',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  bonusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referredUser: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bonusDate: {
    color: '#9E9EAF',
    fontSize: 11,
    marginTop: 4,
  },
  bonusRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  bonusAmount: {
    color: '#10B981',
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
