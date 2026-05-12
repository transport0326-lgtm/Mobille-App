import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  Alert,
  Image,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { register } from '../../redux/sagas/register/registerAction';
import { resetRegister } from '../../redux/slices/registerSlice';
import { uploadDocument } from '../../redux/sagas/register/uploadAction';
import { searchSuggestions, reverseGeocode, type Suggestion } from '../../utils/mapProviders';
import type { RootState, AppDispatch } from '../../redux/store';

type CreateAccountScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateAccount'>;
  route: RouteProp<RootStackParamList, 'CreateAccount'>;
};

type UserRole = 'customer' | 'rider';
type VehicleType = 'bike' | 'auto' | 'miniTruck' | 'truck';

const VEHICLE_TYPES: { id: VehicleType; emoji: string; label: string }[] = [
  { id: 'bike', emoji: '🏍️', label: 'Bike' },
  { id: 'auto', emoji: '🛺', label: 'Auto' },
  { id: 'miniTruck', emoji: '🚚', label: 'Mini Truck' },
  { id: 'truck', emoji: '🚛', label: 'Truck' },
];


// ─── Component ────────────────────────────────────────────────────────────────

const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({ navigation, route }) => {
  const { phoneNumber } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector((state: RootState) => state.register);

  // ── Basic fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('customer');

  // ── Rider fields
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [dlPhotoName, setDlPhotoName] = useState<string | null>(null);
  const [rcNumber, setRcNumber] = useState('');
  const [rcPhotoName, setRcPhotoName] = useState<string | null>(null);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<Suggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mappls Places Search — 350 ms debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (deliveryAddress.trim().length < 3) { setLocationSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLocationLoading(true);
      try {
        setLocationSuggestions(await searchSuggestions(deliveryAddress));
      } catch {
        setLocationSuggestions([]);
      }
      setLocationLoading(false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [deliveryAddress]);

  const handleSelectSuggestion = (item: Suggestion) => {
    setDeliveryAddress(item.address ? `${item.name}, ${item.address}` : item.name);
    setLocationSuggestions([]);
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setDetectingLocation(false);
          return;
        }
      }
      Geolocation.getCurrentPosition(
        async pos => {
          const addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setDeliveryAddress(addr);
          setLocationSuggestions([]);
          setDetectingLocation(false);
        },
        () => {
          Alert.alert('Error', 'Could not detect your location. Please try again.');
          setDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    } catch {
      setDetectingLocation(false);
    }
  };

  // Navigate on success
  useEffect(() => {
    if (success) {
      dispatch(resetRegister());
      navigation.navigate(role === 'rider' ? 'RiderDashboard' : 'CustomerDashboard');
    }
  }, [success]);

  // Show alert on API error
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
      dispatch(resetRegister());
    }
  }, [error]);

  // ── Photo picker — upload fires immediately after selection
  const applyAsset = (docType: 'dl' | 'rc', uri: string, name: string) => {
    if (docType === 'dl') setDlPhotoName(name);
    else setRcPhotoName(name);

    dispatch(uploadDocument({
      phone: phoneNumber,
      fileUri: uri,
      fileName: name,
      fileType: 'image/jpeg',
      docType,
    }));
  };

  const handlePickPhoto = (type: 'dl' | 'rc') => {
    const options = { mediaType: 'photo' as const, quality: 0.8 as const };
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () =>
            launchCamera(options, res => {
              const asset = res.assets?.[0];
              if (asset?.uri) applyAsset(type, asset.uri, asset.fileName ?? `${type}.jpg`);
            }),
        },
        {
          text: 'Photo Library',
          onPress: () =>
            launchImageLibrary(options, res => {
              const asset = res.assets?.[0];
              if (asset?.uri) applyAsset(type, asset.uri, asset.fileName ?? `${type}.jpg`);
            }),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  // ── Submit
  const handleCreate = () => {
    if (!fullName.trim() || !email.trim() || loading) return;

    dispatch(
      register({
        phone: phoneNumber,
        name: fullName.trim(),
        email: email.trim(),
        userType: role === 'customer' ? 'user' : 'rider',
        ...(role === 'rider' && {
          vehicleType,
          vehicleNumber: vehicleNumber.trim(),
          dlNumber: dlNumber.trim(),
          rcNumber: rcNumber.trim(),
          deliveryState: deliveryAddress.trim(),
        }),
      }),
    );
  };

  // ── Validation helpers
  const isValidEmail = (v: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
  const isValidVehicleNumber = (v: string) => /^[A-Za-z]{2}-?\d{2}-?[A-Za-z]{0,2}-?\d{4}$/.test(v);
  const isValidDL = (v: string) => v.trim().length >= 6;
  const isValidRC = (v: string) => v.trim().length >= 6;

  const riderValid =
    isValidVehicleNumber(vehicleNumber) &&
    isValidDL(dlNumber) &&
    isValidRC(rcNumber) &&
    deliveryAddress.trim().length > 0;

  const isValid =
    fullName.replace(/[^a-zA-Z]/g, '').length >= 3 &&
    isValidEmail(email) &&
    (role === 'customer' || riderValid);

  // ─── Render ───────────────────────────────────────────────────────────────

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

        <Text style={styles.headerTitle}>Create Account</Text>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Title */}
          <Text style={styles.title}>Let's set up your profile</Text>
          <Text style={styles.subtitle}>Fill in your details to create your account</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <RNTextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#AAAAAA"
              value={fullName}
              onChangeText={t => setFullName(t.replace(/[^a-zA-Z ,]/g, ''))}
              autoCapitalize="words"
            />
          </View>
          {fullName.length > 0 && fullName.replace(/[^a-zA-Z]/g, '').length < 3 && (
            <Text style={styles.fieldError}>Full name must have at least 3 letters</Text>
          )}

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>✉️</Text>
            <RNTextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#AAAAAA"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {email.length > 0 && !isValidEmail(email) && (
            <Text style={styles.fieldError}>Enter a valid email address</Text>
          )}

          {/* Role */}
          <Text style={styles.label}>I want to join as</Text>
          <View style={styles.roleRow}>
            {(['customer', 'rider'] as UserRole[]).map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleCard, role === r && styles.roleCardActive]}
                onPress={() => setRole(r)}
                activeOpacity={0.8}>
                <Text style={styles.roleEmoji}>{r === 'customer' ? '📦' : '🏍️'}</Text>
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Rider Details ── */}
          {role === 'rider' && (
            <>
              <View style={styles.riderCard}>
                <Text style={styles.riderCardTitle}>Rider Details</Text>

                {/* Vehicle Type */}
                <Text style={styles.riderLabel}>Vehicle Type</Text>
                <View style={styles.vehicleRow}>
                  {VEHICLE_TYPES.map(v => (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.vehicleChip, vehicleType === v.id && styles.vehicleChipActive]}
                      onPress={() => setVehicleType(v.id)}
                      activeOpacity={0.8}>
                      <Text style={styles.vehicleChipEmoji}>{v.emoji}</Text>
                      <Text style={[styles.vehicleChipLabel, vehicleType === v.id && styles.vehicleChipLabelActive]}>
                        {v.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Vehicle Number */}
                <Text style={styles.riderLabel}>Vehicle Number</Text>
                <View style={styles.riderInput}>
                  <Text style={styles.inputIcon}>🚗</Text>
                  <RNTextInput
                    style={styles.input}
                    placeholder="e.g., DH-12-3456"
                    placeholderTextColor="#AAAAAA"
                    value={vehicleNumber}
                    onChangeText={setVehicleNumber}
                    autoCapitalize="characters"
                  />
                </View>
                {vehicleNumber.length > 0 && !isValidVehicleNumber(vehicleNumber) && (
                  <Text style={styles.fieldError}>Enter a valid vehicle number (e.g. KA-01-AB-1234)</Text>
                )}

                {/* DL Number */}
                <Text style={styles.riderLabel}>Driving License (DL) Number</Text>
                <View style={styles.riderInput}>
                  <Text style={styles.inputIcon}>📄</Text>
                  <RNTextInput
                    style={styles.input}
                    placeholder="Enter DL number"
                    placeholderTextColor="#AAAAAA"
                    value={dlNumber}
                    onChangeText={setDlNumber}
                    autoCapitalize="characters"
                  />
                </View>
                {dlNumber.length > 0 && !isValidDL(dlNumber) && (
                  <Text style={styles.fieldError}>DL number must be at least 6 characters</Text>
                )}

                {/* DL Photo */}
                <Text style={styles.riderLabel}>DL Photo</Text>
                <TouchableOpacity style={styles.uploadBox} onPress={() => handlePickPhoto('dl')} activeOpacity={0.75}>
                  {dlPhotoName ? (
                    <>
                      <Text style={styles.uploadDoneIcon}>✅</Text>
                      <Text style={styles.uploadDoneText} numberOfLines={1}>{dlPhotoName}</Text>
                      <Text style={styles.uploadChangeText}>Tap to change</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.uploadIcon}>📤</Text>
                      <Text style={styles.uploadTitle}>Upload DL Photo</Text>
                      <Text style={styles.uploadHint}>JPG, PNG or PDF, Max 2MB</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* RC Number */}
                <Text style={styles.riderLabel}>RC Card Number</Text>
                <View style={styles.riderInput}>
                  <Text style={styles.inputIcon}>📋</Text>
                  <RNTextInput
                    style={styles.input}
                    placeholder="Enter RC number"
                    placeholderTextColor="#AAAAAA"
                    value={rcNumber}
                    onChangeText={setRcNumber}
                    autoCapitalize="characters"
                  />
                </View>
                {rcNumber.length > 0 && !isValidRC(rcNumber) && (
                  <Text style={styles.fieldError}>RC number must be at least 6 characters</Text>
                )}

                {/* RC Photo */}
                <Text style={styles.riderLabel}>RC Photo</Text>
                <TouchableOpacity style={[styles.uploadBox, { marginBottom: 0 }]} onPress={() => handlePickPhoto('rc')} activeOpacity={0.75}>
                  {rcPhotoName ? (
                    <>
                      <Text style={styles.uploadDoneIcon}>✅</Text>
                      <Text style={styles.uploadDoneText} numberOfLines={1}>{rcPhotoName}</Text>
                      <Text style={styles.uploadChangeText}>Tap to change</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.uploadIcon}>📤</Text>
                      <Text style={styles.uploadTitle}>Upload RC Photo</Text>
                      <Text style={styles.uploadHint}>JPG, PNG or PDF, Max 2MB</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* ── Add Your Address ── */}
              <View style={styles.addressHeader}>
                <Text style={styles.addressHeaderTitle}>Add Your Address</Text>
                <Text style={styles.addressHeaderSub}>Search your area or use current location</Text>
              </View>

              <View style={styles.locationSection}>
                {/* Search input */}
                <View style={styles.locationInputRow}>
                  <MaterialIcons name="search" size={20} color="#808080" />
                  <View style={{ flex: 1 }}>
                    <RNTextInput
                      style={styles.locationInputText}
                      placeholder="Search area, city or pin code..."
                      placeholderTextColor="#9E9E9E"
                      value={deliveryAddress}
                      onChangeText={setDeliveryAddress}
                    />
                    <Text style={styles.poweredBy}>
                      {'Powered by '}<Text style={styles.poweredByGoogle}>Google</Text>
                    </Text>
                  </View>
                </View>

                {/* Suggestions list */}
                {(locationLoading || locationSuggestions.length > 0) && (
                  <View style={styles.suggestList}>
                    {locationLoading ? (
                      <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 14 }} />
                    ) : (
                      locationSuggestions.map((item, i) => (
                        <React.Fragment key={item.id}>
                          <TouchableOpacity
                            style={[styles.suggestItem, i === 0 && styles.suggestItemFirst]}
                            onPress={() => handleSelectSuggestion(item)}
                            activeOpacity={0.7}>
                            <MaterialIcons name="location_on" size={16} color="#8C2626" />
                            <Text
                              style={[styles.suggestItemText, i === 0 && styles.suggestItemTextFirst]}
                              numberOfLines={1}>
                              {item.address ? `${item.name}, ${item.address}` : item.name}
                            </Text>
                            {i === 0 && <MaterialIcons name="north_west" size={11} color="#808080" />}
                          </TouchableOpacity>
                          {i < locationSuggestions.length - 1 && (
                            <View style={styles.suggestDivider} />
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </View>
                )}

                {/* OR divider */}
                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                {/* Use Current Location */}
                <TouchableOpacity
                  style={styles.useLocBtn}
                  onPress={handleDetectLocation}
                  disabled={detectingLocation}
                  activeOpacity={0.85}>
                  <View style={styles.useLocIconBox}>
                    {detectingLocation
                      ? <ActivityIndicator size="small" color={Colors.white} />
                      : <MaterialIcons name="my_location" size={15} color={Colors.white} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.useLocTitle}>Use Current Location</Text>
                    <Text style={styles.useLocSub}>Auto-detect using GPS</Text>
                  </View>
                  <MaterialIcons name="chevron_right" size={18} color={Colors.secondary} />
                </TouchableOpacity>
              </View>
            </>
          )}

        </ScrollView>

        {/* Fixed bottom button — stays visible while the form scrolls */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.createBtn, (!isValid || loading) && styles.createBtnDisabled]}
            onPress={handleCreate}
            activeOpacity={0.85}
            disabled={!isValid || loading}>
            <Text style={styles.createBtnText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },

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
  // Scroll
  scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textDark, marginBottom: 6 },
  subtitle: { fontSize: 13, color: Colors.textGray, marginBottom: 28 },

  // Input
  label: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.borderGray,
    borderRadius: 10, paddingHorizontal: 14, marginBottom: 20, height: 52,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.textDark },
  fieldError: { color: '#D32F2F', fontSize: 12, fontWeight: '500', marginTop: -14, marginBottom: 12 },

  // Role
  roleRow: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  roleCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 20, borderRadius: 12, borderWidth: 1.5,
    borderColor: Colors.borderGray, backgroundColor: Colors.inputBg, gap: 8,
  },
  roleCardActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  roleEmoji: { fontSize: 28 },
  roleText: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  roleTextActive: { color: Colors.white },

  // Rider card
  riderCard: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12,
    padding: 16, marginBottom: 16, backgroundColor: Colors.white,
  },
  riderCardTitle: { fontSize: 15, fontWeight: '800', color: Colors.primary, marginBottom: 14 },
  riderLabel: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 8 },

  // Vehicle chips
  vehicleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  vehicleChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.secondary,
  },
  vehicleChipActive: { backgroundColor: Colors.primary },
  vehicleChipEmoji: { fontSize: 13 },
  vehicleChipLabel: { fontSize: 11, fontWeight: '600', color: Colors.white },
  vehicleChipLabelActive: { color: Colors.white },

  // Rider input
  riderInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.borderGray,
    borderRadius: 10, paddingHorizontal: 14, marginBottom: 14, height: 50,
  },

  // Upload box
  uploadBox: {
    borderWidth: 1.5, borderColor: Colors.borderGray, borderStyle: 'dashed',
    borderRadius: 10, paddingVertical: 20, alignItems: 'center',
    backgroundColor: '#FAFAFA', marginBottom: 14,
  },
  uploadIcon: { fontSize: 28, marginBottom: 6 },
  uploadTitle: { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 4 },
  uploadHint: { fontSize: 12, color: Colors.textGray },
  uploadDoneIcon: { fontSize: 24, marginBottom: 4 },
  uploadDoneText: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 2, maxWidth: '80%' },
  uploadChangeText: { fontSize: 11, color: Colors.textGray },

  // Address header (dark navy card)
  addressHeader: {
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom:10
  },
  addressHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  addressHeaderSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },

  // Location search section
  locationSection: { gap: 10, marginBottom: 24 },

  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#D1D6E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  locationInputText: {
    fontSize: 12,
    color: Colors.textDark,
    padding: 0,
    margin: 0,
  },
  poweredBy: { fontSize: 8, color: '#ADADAD' },
  poweredByGoogle: { fontSize: 8, fontWeight: '600', color: '#4285F5' },

  // Suggestions list
  suggestList: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#D1D6E0',
    borderRadius: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  suggestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: Colors.white,
  },
  suggestItemFirst: { backgroundColor: '#F2F7FF' },
  suggestItemText: { flex: 1, fontSize: 11, color: '#525252' },
  suggestItemTextFirst: { fontWeight: '600', color: Colors.secondary },
  suggestDivider: { height: 1, backgroundColor: '#EBEBEB', marginHorizontal: 12 },

  // OR divider
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  orLine: { flex: 1, height: 1, backgroundColor: '#D6D6D6' },
  orText: { fontSize: 9, fontWeight: '600', color: '#8C8C8C' },

  // Use Current Location button
  useLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F2F7FF',
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  useLocIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useLocTitle: { fontSize: 12, fontWeight: '600', color: Colors.secondary },
  useLocSub: { fontSize: 9, color: '#8C8C8C' },

  // Dropdown
  dropdownTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.borderGray,
    borderRadius: 10, paddingHorizontal: 14, height: 50,
  },
  dropdownTriggerFilled: { borderColor: Colors.secondary, backgroundColor: '#F0F4FF' },
  dropdownValue: { fontSize: 14, color: Colors.textDark, flex: 1 },
  dropdownValueFilled: { color: Colors.secondary, fontWeight: '600' },
  dropdownArrow: { fontSize: 11, color: Colors.textGray, marginLeft: 8 },
  dropdownList: {
    borderWidth: 1, borderColor: Colors.borderGray, borderRadius: 10,
    marginTop: 4, backgroundColor: Colors.white,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dropdownItemActive: { backgroundColor: '#F0F4FF' },
  dropdownItemText: { fontSize: 14, color: Colors.textDark },
  dropdownItemTextActive: { color: Colors.secondary, fontWeight: '700' },

  // Zones multi-select
  zonesListContainer: {
    borderWidth: 1, borderColor: Colors.borderGray, borderRadius: 10,
    marginTop: 4, backgroundColor: Colors.white,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, overflow: 'hidden',
  },
  zoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: Colors.borderGray,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white,
  },
  checkboxChecked: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  checkboxTick: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  zoneText: { fontSize: 14, color: Colors.textDark },

  // Fixed bottom bar
  bottomBar: {
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 14,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },

  // Button
  createBtn: {
    backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', elevation: 2, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  // Delivery location
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    marginBottom: 4,
  },
  detectBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  suggestionsBox: {
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
  },
  suggestionName: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  suggestionAddress: { fontSize: 11, color: Colors.textGray, marginTop: 2 },
});

export default CreateAccountScreen;
