import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:8000/api/v1';

export default function KycScreen() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [remarks, setRemarks] = useState<string>('');
  
  // Form fields
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  
  // Document paths
  const [aadhaarFront, setAadhaarFront] = useState<string | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<string | null>(null);
  const [pan, setPan] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      
      // Fetch user profile to get kyc_status
      const userRes = await fetch(`${API_URL}/auth/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setKycStatus(userData.kyc_status);
        
        // Fetch kyc record for remarks and prefilling bank details if exists
        const kycRes = await fetch(`${API_URL}/kyc/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (kycRes.ok) {
          const kycData = await kycRes.json();
          if (kycData.length > 0) {
            const doc = kycData[0];
            setBankAccount(doc.bank_account_number);
            setIfsc(doc.ifsc_code);
            setBankName(doc.bank_name);
            setRemarks(doc.review_remarks || '');
            
            // Prefill documents preview using absolute URL
            if (doc.aadhaar_front) setAadhaarFront(doc.aadhaar_front);
            if (doc.aadhaar_back) setAadhaarBack(doc.aadhaar_back);
            if (doc.pan) setPan(doc.pan);
            if (doc.selfie) setSelfie(doc.selfie);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async (field: 'aadhaar_front' | 'aadhaar_back' | 'pan' | 'selfie') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please allow access to your gallery to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (field === 'aadhaar_front') setAadhaarFront(uri);
      else if (field === 'aadhaar_back') setAadhaarBack(uri);
      else if (field === 'pan') setPan(uri);
      else if (field === 'selfie') setSelfie(uri);
    }
  };

  const handleSubmit = async () => {
    if (!bankAccount || !ifsc || !bankName) {
      Alert.alert('Details Required', 'Please fill in all bank details.');
      return;
    }

    if (!aadhaarFront || !aadhaarBack || !pan || !selfie) {
      Alert.alert('Documents Required', 'Please upload screenshots/photos of Aadhaar Front, Aadhaar Back, PAN, and a Selfie.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const formData = new FormData();
      
      formData.append('bank_account_number', bankAccount);
      formData.append('ifsc_code', ifsc);
      formData.append('bank_name', bankName);

      // Append files if they are local file URIs (not prefilled remote HTTP URLs)
      const appendFileField = (fieldName: string, uri: string | null) => {
        if (uri && uri.startsWith('file://')) {
          const uriParts = uri.split('/');
          const fileName = uriParts[uriParts.length - 1];
          const fileType = fileName.split('.').pop() || 'jpeg';
          formData.append(fieldName, {
            uri,
            name: fileName,
            type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
          } as any);
        }
      };

      appendFileField('aadhaar_front', aadhaarFront);
      appendFileField('aadhaar_back', aadhaarBack);
      appendFileField('pan', pan);
      appendFileField('selfie', selfie);

      const res = await fetch(`${API_URL}/kyc/submit/`, {
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
          'KYC Submitted',
          'Your KYC details have been uploaded successfully and are pending supervisor verification.',
          [{ text: 'OK', onPress: () => router.replace('/(app)/profile') }]
        );
      } else {
        Alert.alert('Submission Failed', data.error || 'Failed to submit KYC. Please verify inputs.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const isFormEditable = kycStatus === 'pending' || kycStatus === 'rejected';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>KYC Verification</Text>
        <Text style={styles.subtitle}>Upload identification and bank credentials for payout routing</Text>
      </View>

      {kycStatus === 'approved' && (
        <View style={[styles.statusBox, styles.statusApproved]}>
          <Text style={styles.statusBoxTitle}>✅ Verification Approved</Text>
          <Text style={styles.statusBoxText}>Your KYC and bank details are validated. You can start investing and receiving payouts.</Text>
        </View>
      )}

      {kycStatus === 'under_review' && (
        <View style={[styles.statusBox, styles.statusReview]}>
          <Text style={styles.statusBoxTitle}>⏳ Under Review</Text>
          <Text style={styles.statusBoxText}>Your details are currently being reviewed by our compliance officers. Approval usually takes up to 24 hours.</Text>
        </View>
      )}

      {kycStatus === 'rejected' && (
        <View style={[styles.statusBox, styles.statusRejected]}>
          <Text style={styles.statusBoxTitle}>❌ Verification Rejected</Text>
          <Text style={styles.statusBoxText}>Remarks: {remarks || 'Please re-verify and re-upload correct documents.'}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>1. Bank Details</Text>
      <View style={styles.formBox}>
        <Text style={styles.inputLabel}>Bank Name</Text>
        <TextInput 
          style={[styles.input, !isFormEditable && styles.disabledInput]}
          placeholder="e.g. HDFC Bank"
          placeholderTextColor="#555"
          value={bankName}
          onChangeText={setBankName}
          editable={isFormEditable}
        />

        <Text style={styles.inputLabel}>Account Number</Text>
        <TextInput 
          style={[styles.input, !isFormEditable && styles.disabledInput]}
          placeholder="e.g. 50100293849182"
          placeholderTextColor="#555"
          value={bankAccount}
          onChangeText={setBankAccount}
          keyboardType="numeric"
          editable={isFormEditable}
        />

        <Text style={styles.inputLabel}>IFSC Code</Text>
        <TextInput 
          style={[styles.input, !isFormEditable && styles.disabledInput]}
          placeholder="e.g. HDFC0000123"
          placeholderTextColor="#555"
          value={ifsc}
          onChangeText={setIfsc}
          autoCapitalize="characters"
          editable={isFormEditable}
        />
      </View>

      <Text style={styles.sectionTitle}>2. Identity Documents</Text>
      <View style={styles.docsContainer}>
        {/* Aadhaar Front */}
        <View style={styles.docWrapper}>
          <Text style={styles.docLabel}>Aadhaar Card (Front)</Text>
          <TouchableOpacity 
            style={styles.docPicker} 
            onPress={() => handlePickDocument('aadhaar_front')}
            disabled={!isFormEditable}
          >
            {aadhaarFront ? (
              <Image source={{ uri: aadhaarFront }} style={styles.docImage} />
            ) : (
              <Text style={styles.pickerText}>➕ Upload Front</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Aadhaar Back */}
        <View style={styles.docWrapper}>
          <Text style={styles.docLabel}>Aadhaar Card (Back)</Text>
          <TouchableOpacity 
            style={styles.docPicker} 
            onPress={() => handlePickDocument('aadhaar_back')}
            disabled={!isFormEditable}
          >
            {aadhaarBack ? (
              <Image source={{ uri: aadhaarBack }} style={styles.docImage} />
            ) : (
              <Text style={styles.pickerText}>➕ Upload Back</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* PAN Card */}
        <View style={styles.docWrapper}>
          <Text style={styles.docLabel}>PAN Card</Text>
          <TouchableOpacity 
            style={styles.docPicker} 
            onPress={() => handlePickDocument('pan')}
            disabled={!isFormEditable}
          >
            {pan ? (
              <Image source={{ uri: pan }} style={styles.docImage} />
            ) : (
              <Text style={styles.pickerText}>➕ Upload PAN</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Selfie */}
        <View style={styles.docWrapper}>
          <Text style={styles.docLabel}>User Selfie</Text>
          <TouchableOpacity 
            style={styles.docPicker} 
            onPress={() => handlePickDocument('selfie')}
            disabled={!isFormEditable}
          >
            {selfie ? (
              <Image source={{ uri: selfie }} style={styles.docImage} />
            ) : (
              <Text style={styles.pickerText}>➕ Take Selfie</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isFormEditable && (
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit KYC for Approval</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back to Profile</Text>
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
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#0A0915',
    justifyContent: 'center',
    alignItems: 'center',
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
  statusBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  statusApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  statusReview: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#F59E0B',
  },
  statusRejected: {
    backgroundColor: 'rgba(239, 110, 110, 0.1)',
    borderColor: '#EF4444',
  },
  statusBoxTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statusBoxText: {
    color: '#9E9EAF',
    fontSize: 11,
    lineHeight: 16,
  },
  sectionTitle: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 12,
  },
  formBox: {
    backgroundColor: '#151428',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#9E9EAF',
    fontSize: 11,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0A0915',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: '#111020',
  },
  docsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30,
  },
  docWrapper: {
    width: '47%',
    marginBottom: 10,
  },
  docLabel: {
    color: '#9E9EAF',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
  },
  docPicker: {
    backgroundColor: '#151428',
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  docImage: {
    width: '100%',
    height: '100%',
  },
  pickerText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#9E9EAF',
    fontSize: 14,
  },
});
