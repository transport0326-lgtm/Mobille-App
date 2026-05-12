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
  ActivityIndicator,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { updateProfile } from '../../redux/sagas/profile/updateProfileAction';
import { resetUpdateProfile } from '../../redux/slices/updateProfileSlice';

type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { data } = useSelector((state: RootState) => state.profile);
  const { loading, success, error } = useSelector((state: RootState) => state.updateProfile);
  const user = data?.user;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [nameError, setNameError]   = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.name  || '');
      setPhone(user.phone    || '');
      setEmail(user.email    || '');
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      dispatch(resetUpdateProfile());
      navigation.goBack();
    }
  }, [success]);

  const validate = () => {
    let valid = true;
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setNameError('Name is required.');
      valid = false;
    } else if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters.');
      valid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setNameError('Name can only contain letters and spaces.');
      valid = false;
    } else {
      setNameError('');
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;
    dispatch(updateProfile({ name: fullName.trim(), phone: phone.trim(), email: email.trim() }));
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

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{fullName ? getInitials(fullName) : '?'}</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={[styles.fieldInput, nameError ? styles.fieldInputError : null]}
                value={fullName}
                onChangeText={v => { setFullName(v); if (nameError) setNameError(''); }}
                placeholder="Enter your name"
                placeholderTextColor="#AAAAAA"
                autoCapitalize="words"
              />
              {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.fieldInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#AAAAAA"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={[styles.fieldInput, emailError ? styles.fieldInputError : null]}
                value={email}
                onChangeText={v => { setEmail(v); if (emailError) setEmailError(''); }}
                placeholder="Enter your email"
                placeholderTextColor="#AAAAAA"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color={Colors.white} />
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
    paddingBottom: 24,
    backgroundColor: Colors.background,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },

  form: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  fieldGroup: { marginBottom: 4 },
  fieldLabel: {
    fontSize: 15,
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
  fieldInputError: {
    borderColor: '#DC2626',
  },
  fieldError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 2,
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
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default EditProfileScreen;
