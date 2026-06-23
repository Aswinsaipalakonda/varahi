import { API_URL } from '../../config';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

export default function ScreenshotUploadScreen() {
  const { txnRef } = useLocalSearchParams();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please allow access to your gallery to upload screenshots.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert('Image Required', 'Please select or capture a payment receipt screenshot first.');
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const formData = new FormData();
      
      formData.append('upi_txn_ref', txnRef as string);
      
      const uriParts = imageUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const fileType = fileName.split('.').pop() || 'jpeg';
      
      formData.append('screenshot', {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
      } as any);

      const res = await fetch(`${API_URL}/investments/submit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          'Success',
          'Payment receipt uploaded successfully! It is now pending owner/supervisor review.',
          [{ text: 'Go to Home', onPress: () => router.replace('/(app)/home') }]
        );
      } else {
        Alert.alert('Upload Failed', data.error || 'Failed to submit payment receipt. Please check reference number.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Upload Error', 'A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Proof of Payment</Text>
        <Text style={styles.subtitle}>Upload screenshot for reference: {txnRef}</Text>
      </View>

      <View style={styles.previewBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>📸 No screenshot selected</Text>
            <Text style={styles.placeholderSubtext}>Select the payment confirmation screen showing the UTR/Txn ID clearly.</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.pickButton} onPress={handlePickImage}>
          <Text style={styles.pickButtonText}>{imageUri ? 'Change Screenshot' : 'Select Screenshot'}</Text>
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>Submit Verification Request</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  header: {
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
  previewBox: {
    backgroundColor: '#151428',
    borderRadius: 20,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholderSubtext: {
    color: '#9E9EAF',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  pickButton: {
    backgroundColor: '#151428',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  pickButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9E9EAF',
    fontSize: 14,
  },
});
