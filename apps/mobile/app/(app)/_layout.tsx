import { Tabs } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#0F0E20',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        height: 60,
      },
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#9E9EAF',
    }}>
      <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
      <Tabs.Screen name="plans/index" options={{ title: 'Plans' }} />
      <Tabs.Screen name="portfolio/index" options={{ title: 'Portfolio' }} />
      <Tabs.Screen name="payouts/index" options={{ title: 'Payouts' }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
