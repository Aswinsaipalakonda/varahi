import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, ScrollView, TouchableOpacity, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withRepeat, 
  withSequence, 
  runOnJS 
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    title: "Secure Land Investments",
    desc: "Direct principal assets backed by premium real estate plots. Safe, fully transparent, and audited.",
    color: "#EFF6FF"
  },
  {
    title: "0.7% Daily High Yield",
    desc: "Earn ₹700 daily yield on every ₹1,00,000 principal deposit, distributed every 15 days.",
    color: "#E0F2FE"
  },
  {
    title: "Exclusive Travel Rewards",
    desc: "Reach investment tiers to win luxury trips to Goa and Bangkok, plus 3% immediate spot dividends.",
    color: "#ECFDF5"
  }
];

export default function IndexPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const scrollX = useSharedValue(0);

  // Splash animation values
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Logo entrance
    logoScale.value = withSpring(1, { damping: 10, stiffness: 80 });
    logoOpacity.value = withTiming(1, { duration: 1000 });

    // Pulse background glow
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );

    // Transition to onboarding after delay
    const timer = setTimeout(() => {
      withTiming(0, { duration: 600 }, (finished) => {
        if (finished) {
          runOnJS(setShowSplash)(false);
        }
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    scrollX.value = x;
    const index = Math.round(x / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.15
  }));

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        {/* Glowing Background Ring */}
        <Animated.View style={[styles.glowRing, animatedPulseStyle]} />
        
        {/* Center Logo with animation */}
        <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Text style={styles.splashBrand}>VARAHI CAPITAL</Text>
        <Text style={styles.splashSub}>Secure Wealth Creation</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Varahi Capital</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollContainer}
      >
        {ONBOARDING_DATA.map((item, idx) => (
          <View key={idx} style={[styles.slide, { backgroundColor: item.color }]}>
            <View style={styles.card}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination & CTA Footer */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <View 
                key={idx} 
                style={[
                  styles.dot, 
                  isActive ? styles.dotActive : styles.dotInactive
                ]} 
              />
            );
          })}
        </View>

        {currentIndex === ONBOARDING_DATA.length - 1 ? (
          <TouchableOpacity 
            style={styles.pillButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.disabledPlaceholder} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0B0915',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#2563EB',
    position: 'absolute',
    filter: 'blur(30px)',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    padding: 20
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  splashBrand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 32,
    fontFamily: 'System',
  },
  splashSub: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 32,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    width: '100%',
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDesc: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#E2E8F0',
  },
  pillButton: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledPlaceholder: {
    height: 52, // Keeps layout height uniform during pagination swipes
  }
});
