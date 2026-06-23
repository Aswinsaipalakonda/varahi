import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:8000/api/v1';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const res = await fetch(`${API_URL}/auth/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Varahi Capital?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const getKycBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'under_review': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>My Account</Text>
        <Text style={styles.subtitle}>Manage your settings, KYC, and security</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.profileName}>{profile?.full_name || 'Retail Investor'}</Text>
        <Text style={styles.profileMobile}>{profile?.mobile_number}</Text>
        <View style={[styles.kycBadge, { backgroundColor: getKycBadgeColor(profile?.kyc_status) + '20' }]}>
          <Text style={[styles.kycBadgeText, { color: getKycBadgeColor(profile?.kyc_status) }]}>
            KYC: {profile?.kyc_status?.toUpperCase().replace('_', ' ') || 'PENDING'}
          </Text>
        </View>
      </View>

      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>Wallet Account Balance</Text>
        <Text style={styles.walletValue}>₹{parseFloat(profile?.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>

      <View style={styles.menuBox}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(app)/profile/kyc')}
        >
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>🪪</Text>
            <View>
              <Text style={styles.menuTitle}>KYC Verification</Text>
              <Text style={styles.menuSub}>Submit Identity and Bank details</Text>
            </View>
          </View>
          <Text style={styles.arrow}>❯</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(app)/referral')}
        >
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>🤝</Text>
            <View>
              <Text style={styles.menuTitle}>Referral Dashboard</Text>
              <Text style={styles.menuSub}>Invite friends and view rewards</Text>
            </View>
          </View>
          <Text style={styles.arrow}>❯</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out Account</Text>
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
    marginBottom: 24,
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
  profileCard: {
    backgroundColor: '#151428',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileMobile: {
    color: '#9E9EAF',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  kycBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  kycBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  walletCard: {
    backgroundColor: '#151428',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    marginBottom: 24,
  },
  walletLabel: {
    color: '#9E9EAF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  walletValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  menuBox: {
    backgroundColor: '#151428',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    marginBottom: 30,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuSub: {
    color: '#9E9EAF',
    fontSize: 10,
    marginTop: 2,
  },
  arrow: {
    color: '#555',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
