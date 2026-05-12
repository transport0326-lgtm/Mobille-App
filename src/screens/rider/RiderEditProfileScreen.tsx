import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { RootState, AppDispatch } from '../../redux/store';
import { updateRiderProfile } from '../../redux/sagas/profile/updateRiderProfileAction';
import { resetUpdateRiderProfile } from '../../redux/slices/updateRiderProfileSlice';
import { uploadRiderPhoto } from '../../redux/sagas/profile/uploadRiderPhotoAction';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RiderEditProfile'>;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const RiderEditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { data } = useSelector((state: RootState) => state.riderProfile);
  const { loading, success, error } = useSelector((state: RootState) => state.updateRiderProfile);
  const { loading: photoLoading, url: uploadedPhotoUrl } = useSelector((state: RootState) => state.uploadRiderPhoto);
  const rider = data?.rider;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const existingPhotoUrl = rider?.profilePhotoUrl || null;
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (rider) {
      setFullName(rider.name || '');
      setPhone(rider.phone || '');
      setEmail(rider.email || '');
      setVehicleType(rider.vehicleType || '');
      setVehicleNumber(rider.vehicleNumber || '');
      setEmergencyContact(rider.emergencyContact || '');
    }
  }, [rider]);

  useEffect(() => {
    if (success) {
      dispatch(resetUpdateRiderProfile());
      navigation.goBack();
    }
  }, [success]);

  const isValidName = fullName.replace(/[^a-zA-Z]/g, '').length >= 3;
  const isValidEmail = (v: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
  const isValidPhone = (v: string) => /^[0-9]{10}$/.test(v.replace(/\s|-/g, ''));
  const isValidVehicleNumber = (v: string) => /^[A-Za-z]{2}-?\d{2}-?[A-Za-z]{0,2}-?\d{4}$/.test(v);
  const isValidEmergency = (v: string) => /^[0-9]{10}$/.test(v.replace(/\s|-/g, ''));

  const isFormValid =
    isValidName &&
    isValidEmail(email) &&
    isValidPhone(phone) &&
    isValidVehicleNumber(vehicleNumber) &&
    isValidEmergency(emergencyContact);

  const handleSave = () => {
    if (!isFormValid || loading) return;
    const photoUrl = uploadedPhotoUrl || existingPhotoUrl || undefined;
    dispatch(updateRiderProfile({
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      vehicleNumber: vehicleNumber.trim(),
      emergencyContact: emergencyContact.trim(),
      ...(photoUrl ? { profilePhotoUrl: photoUrl } : {}),
    }));
  };

  const dispatchUpload = (asset: { uri: string; fileName?: string | null; type?: string | null }) => {
    setPhotoUri(asset.uri);
    dispatch(uploadRiderPhoto({
      phone: rider?.phone || phone,
      fileUri: asset.uri,
      fileName: asset.fileName || 'photo.jpg',
      fileType: asset.type || 'image/jpeg',
    }));
  };

  const handleChangePhoto = () => {
    Alert.alert('Change Photo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () =>
          launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false }, res => {
            const a = res.assets?.[0];
            if (a?.uri) dispatchUpload({ uri: a.uri, fileName: a.fileName, type: a.type });
          }),
      },
      {
        text: 'Gallery',
        onPress: () =>
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, res => {
            const a = res.assets?.[0];
            if (a?.uri) dispatchUpload({ uri: a.uri, fileName: a.fileName, type: a.type });
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Image
                  source={require('../../assets/icons/arrow.png')}
                  style={styles.backArrow}
                />
              </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Avatar with edit photo */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8} onPress={handleChangePhoto} disabled={photoLoading}>
              {photoLoading ? (
                <View style={styles.avatarCircle}>
                  <ActivityIndicator color={Colors.secondary} />
                </View>
              ) : uploadedPhotoUrl || photoUri || existingPhotoUrl ? (
                <Image source={{ uri: uploadedPhotoUrl || photoUri || existingPhotoUrl! }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{fullName ? getInitials(fullName) : '?'}</Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraEmoji}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={fullName}
                onChangeText={v => setFullName(v.replace(/[^a-zA-Z ]/g, ''))}
                placeholder="Enter your name"
                placeholderTextColor="#AAAAAA"
                autoCapitalize="words"
              />
              {fullName.length > 0 && !isValidName && (
                <Text style={styles.fieldError}>Full name must have at least 3 letters</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.fieldInput}
                value={phone}
                onChangeText={v => setPhone(v.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="Enter your phone number"
                placeholderTextColor="#AAAAAA"
                keyboardType="number-pad"
                maxLength={10}
              />
              {phone.length > 0 && !isValidPhone(phone) && (
                <Text style={styles.fieldError}>Enter a valid 10-digit phone number</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.fieldInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#AAAAAA"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {email.length > 0 && !isValidEmail(email) && (
                <Text style={styles.fieldError}>Enter a valid email address</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Vehicle Type</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputDisabled]}
                value={vehicleType}
                editable={false}
                placeholder="e.g. Bike, Auto"
                placeholderTextColor="#AAAAAA"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Vehicle Number</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputDisabled]}
                value={vehicleNumber}
                editable={false}
                placeholder="e.g. WB-02-AB-3456"
                placeholderTextColor="#AAAAAA"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Emergency Contact</Text>
              <TextInput
                style={styles.fieldInput}
                value={emergencyContact}
                onChangeText={v => setEmergencyContact(v.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="Enter emergency contact number"
                placeholderTextColor="#AAAAAA"
                keyboardType="number-pad"
                maxLength={10}
              />
              {emergencyContact.length > 0 && !isValidEmergency(emergencyContact) && (
                <Text style={styles.fieldError}>Enter a valid 10-digit phone number</Text>
              )}
            </View>

          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, (!isFormValid || loading) && { opacity: 0.5 }]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={!isFormValid || loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backArrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },

  headerTitle: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: 12,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  avatarSection: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: Colors.secondary,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D0D8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.secondary,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraEmoji: {
    fontSize: 13,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },

  form: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  fieldError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 2,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 4,
    marginLeft: 2,
  },
  fieldInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: 12,
  },
  fieldInputDisabled: {
    backgroundColor: '#F3F4F6',
    color: Colors.textGray,
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default RiderEditProfileScreen;
