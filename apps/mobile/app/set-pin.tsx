import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SetPinPage() {
  const [pin, setPin] = useState('');
  const router = useRouter();

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // If 4 digits entered, automatically navigate to home (represented by tab layout)
      if (newPin.length === 4) {
        setTimeout(() => {
          // In Expo Router, if we have tab routes, we'll configure /home
          // For now, redirect to our index, or we'll define tab routing under (app)
          router.push('./(app)');
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.header}>
        <Text style={styles.title}>Set Login PIN</Text>
        <Text style={styles.subtitle}>Create a 4-digit security PIN for daily quick access.</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.pinDisplayContainer}>
        <View style={styles.dotsRow}>
          {Array.from({ length: 4 }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <View 
                key={idx} 
                style={[
                  styles.dot, 
                  isFilled ? styles.dotFilled : styles.dotEmpty
                ]} 
              />
            );
          })}
        </View>
      </Animated.View>

      {/* Numerical Keypad */}
      <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.keypad}>
        <View style={styles.keypadRow}>
          {['1', '2', '3'].map((num) => (
            <TouchableOpacity key={num} style={styles.key} onPress={() => handleKeyPress(num)}>
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          {['4', '5', '6'].map((num) => (
            <TouchableOpacity key={num} style={styles.key} onPress={() => handleKeyPress(num)}>
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          {['7', '8', '9'].map((num) => (
            <TouchableOpacity key={num} style={styles.key} onPress={() => handleKeyPress(num)}>
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          <View style={styles.emptyKey} />
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleDelete}>
            <Text style={styles.keyText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  pinDisplayContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  dotEmpty: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  dotFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  keypad: {
    paddingHorizontal: 36,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyKey: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
});
