import React, { useState, useEffect, useRef } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { useDispatch } from 'react-redux';
import { setBookingCoords } from '../../redux/slices/bookingSlice';
import { fareEstimate } from '../../redux/sagas/booking/fareEstimateAction';
import type { AppDispatch } from '../../redux/store';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput as RNTextInput,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { Suggestion, searchSuggestions, reverseGeocode, forwardGeocode, geocodeByELoc } from '../../utils/mapProviders';

type SetLocationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SetLocation'>;
  route: RouteProp<RootStackParamList, 'SetLocation'>;
};

const RECENT_LOCATIONS: Suggestion[] = [
  { id: 'r1', name: 'Park Street, Kolkata', address: 'Park Street, Kolkata, West Bengal 700016' },
  { id: 'r2', name: 'Hitech City, Hyderabad', address: 'Hitech City, Madhapur, Hyderabad, TS 500081' },
  { id: 'r3', name: 'Chauliaganj, Cuttack', address: 'Chauliaganj, Cuttack, Odisha 753001' },
];

const SetLocationScreen: React.FC<SetLocationScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { type, currentPickup, currentDropoff } = route.params;

  const [pickupText, setPickupText] = useState(currentPickup || '');
  const [dropoffText, setDropoffText] = useState(currentDropoff || '');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(
    route.params.pickupLat != null && route.params.pickupLng != null
      ? { lat: route.params.pickupLat, lng: route.params.pickupLng }
      : null,
  );
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(
    route.params.dropoffLat != null && route.params.dropoffLng != null
      ? { lat: route.params.dropoffLat, lng: route.params.dropoffLng }
      : null,
  );
  const [confirming, setConfirming] = useState(false);
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff'>(type);
  const [fieldFocused, setFieldFocused] = useState<'pickup' | 'dropoff' | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const dropoffRef = useRef<RNTextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync text + coords when returning from MapPicker
  useEffect(() => {
    if (route.params.currentPickup !== undefined) setPickupText(route.params.currentPickup);
    if (route.params.currentDropoff !== undefined) setDropoffText(route.params.currentDropoff);
    if (route.params.pickupLat != null && route.params.pickupLng != null) {
      setPickupCoords({ lat: route.params.pickupLat, lng: route.params.pickupLng });
    }
    if (route.params.dropoffLat != null && route.params.dropoffLng != null) {
      setDropoffCoords({ lat: route.params.dropoffLat, lng: route.params.dropoffLng });
    }
  }, [
    route.params.currentPickup,
    route.params.currentDropoff,
    route.params.pickupLat,
    route.params.pickupLng,
    route.params.dropoffLat,
    route.params.dropoffLng,
  ]);

  useEffect(() => {
    requestAndDetectLocation();
    if (type === 'dropoff') {
      setTimeout(() => dropoffRef.current?.focus(), 500);
    }
  }, []);

  // Fetch suggestions when active field text changes
  useEffect(() => {
    const activeText = activeField === 'pickup' ? pickupText : dropoffText;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!loadingLocation && activeText.trim().length > 1 && fieldFocused === activeField) {
      debounceRef.current = setTimeout(() => runSearchSuggestions(activeText), 350);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pickupText, dropoffText, activeField, fieldFocused, loadingLocation]);

  const runSearchSuggestions = async (query: string) => {
    setSuggestionsLoading(true);
    try {
      setSuggestions(await searchSuggestions(query));
    } catch {
      setSuggestions([]);
    }
    setSuggestionsLoading(false);
  };

  const requestAndDetectLocation = async () => {
    setLoadingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'Transpport needs your location to auto-fill the pickup address.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission denied. Please enter pickup address manually.');
          setPickupText('');
          setLoadingLocation(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async pos => {
          const { latitude, longitude } = pos.coords;
          console.log('[SetLocation] GPS success — lat:', latitude, 'lng:', longitude);
          setPickupCoords({ lat: latitude, lng: longitude });
          try {
            const addr = await reverseGeocode(latitude, longitude);
            setPickupText(addr !== 'Selected Location' ? addr : 'Current Location');
          } catch {
            setPickupText('Current Location');
          }
          setLoadingLocation(false);
        },
        error => {
          console.log('Location Error:', error);
          setPickupText('');
          setLoadingLocation(false);
          Alert.alert('Error', 'Could not detect location. Please type manually.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0, forceRequestLocation: true, showLocationDialog: true },
      );
    } catch (err) {
      console.log('Catch Error:', err);
      setPickupText('');
      setLoadingLocation(false);
    }
  };

 const handleSelectSuggestion = (item: Suggestion) => {
  // ✅ Sirf lat/lng check, no eLoc
  if (item.lat == null || item.lng == null) {
    Alert.alert('Location not found', 'Please try a more specific search.');
    return;
  }

  const fullText = item.address ? `${item.name}, ${item.address}` : item.name;
  const coords = { lat: item.lat, lng: item.lng };

  if (activeField === 'pickup') {
    setPickupText(fullText);
    setPickupCoords(coords);
  } else {
    setDropoffText(fullText);
    setDropoffCoords(coords);
  }

  setSuggestions([]);
  setFieldFocused(null);
};

  const handleConfirm = async () => {
    setConfirming(true);

    let finalPickupCoords = pickupCoords;
    let finalDropoffCoords = dropoffCoords;

    console.log('\n================ START CONFIRM =================');
    console.log('Initial Pickup:', pickupCoords);
    console.log('Initial Dropoff:', dropoffCoords);

    try {
      // ===== PICKUP RESOLUTION =====
      if (!finalPickupCoords) {

        if (!finalPickupCoords && pickupText) {
          console.log('🔁 Resolving Pickup via forwardGeocode...');
          finalPickupCoords = await forwardGeocode(pickupText);
          console.log('📍 Pickup from text:', finalPickupCoords);
        }
      }

      // ===== DROPOFF RESOLUTION =====
      if (!finalDropoffCoords) {

        if (!finalDropoffCoords && dropoffText) {
          console.log('🔁 Resolving Dropoff via forwardGeocode...');
          finalDropoffCoords = await forwardGeocode(dropoffText);
          console.log('📍 Dropoff from text:', finalDropoffCoords);
        }
      }

      // ===== FINAL OUTPUT =====
      console.log('\n========== FINAL COORDS ==========');
      console.log('Pickup Latitude :', finalPickupCoords?.lat);
      console.log('Pickup Longitude:', finalPickupCoords?.lng);
      console.log('Dropoff Latitude :', finalDropoffCoords?.lat);
      console.log('Dropoff Longitude:', finalDropoffCoords?.lng);
      console.log('=================================\n');

      // ===== SAFETY CHECK =====
      if (!finalPickupCoords || !finalDropoffCoords) {
        console.log('❌ ERROR: Coordinates missing');
        Alert.alert('Error', 'Could not fetch coordinates. Please try again.');
        return;
      }

      // ===== REDUX DISPATCH =====
      const payload = {
        pickupLat: finalPickupCoords.lat,
        pickupLng: finalPickupCoords.lng,
        dropoffLat: finalDropoffCoords.lat,
        dropoffLng: finalDropoffCoords.lng,
      };

      dispatch(setBookingCoords(payload));

      console.log('📦 Dispatched Coords:', payload);

      // ===== FARE API =====
      dispatch(
        fareEstimate({
          ...payload,
          vehicleType: route.params.vehicleType ?? 'bike',
        })
      );

      // ===== NAVIGATION =====
      navigation.navigate('CustomerDashboard', {
        confirmedPickup: pickupText,
        confirmedDropoff: dropoffText,
      });

    } catch (err) {
      console.log('🔥 handleConfirm ERROR:', err);
      Alert.alert('Error', 'Something went wrong while confirming location.');
    } finally {
      // ✅ ALWAYS RUN
      setConfirming(false);
    }
  };

  const isReady = pickupText.trim().length > 0 && dropoffText.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Location</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Pickup */}
          <TouchableOpacity
            style={[styles.inputBox, activeField === 'pickup' && styles.inputBoxActive]}
            onPress={() => { setActiveField('pickup'); setFieldFocused('pickup'); }}
            activeOpacity={0.9}>
            <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
            {loadingLocation ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Detecting your location...</Text>
              </View>
            ) : (
              <RNTextInput
                style={styles.inputText}
                value={pickupText}
                onChangeText={setPickupText}
                placeholder="Enter pickup location"
                placeholderTextColor="#AAAAAA"
                onFocus={() => setFieldFocused('pickup')}
              />
            )}
            {!loadingLocation && (
              <TouchableOpacity
                onPress={requestAndDetectLocation}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ fontSize: 18 }}>📍</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Dropoff */}
          <TouchableOpacity
            style={[styles.inputBox, activeField === 'dropoff' && styles.inputBoxActive]}
            onPress={() => {
              setActiveField('dropoff');
              setFieldFocused('dropoff');
              setTimeout(() => dropoffRef.current?.focus(), 100);
            }}
            activeOpacity={0.9}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <RNTextInput
              ref={dropoffRef}
              style={styles.inputText}
              value={dropoffText}
              onChangeText={text => { setDropoffText(text); setActiveField('dropoff'); }}
              placeholder="Enter drop-off location"
              placeholderTextColor="#AAAAAA"
              onFocus={() => setFieldFocused('dropoff')}
            />
          </TouchableOpacity>

          {/* Choose on Map */}
          <TouchableOpacity
            style={styles.chooseOnMapRow}
            onPress={() =>
              navigation.navigate('MapPicker', {
                type: activeField,
                currentPickup: pickupText,
                currentDropoff: dropoffText,
                pickupLat: pickupCoords?.lat,
                pickupLng: pickupCoords?.lng,
                dropoffLat: dropoffCoords?.lat,
                dropoffLng: dropoffCoords?.lng,
              })
            }
            activeOpacity={0.75}>
            <Text style={styles.chooseOnMapPin}>📍</Text>
            <Text style={styles.chooseOnMapText}>Choose on Map</Text>
          </TouchableOpacity>

          {/* Search Results */}
          {fieldFocused === activeField && (suggestionsLoading || suggestions.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {suggestionsLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 12 }} />
              ) : (
                suggestions.map((item, i) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.resultRow, i === suggestions.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => handleSelectSuggestion(item)}
                    activeOpacity={0.7}>
                    <Text style={styles.resultPin}>📍</Text>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      {item.address ? <Text style={styles.resultAddr}>{item.address}</Text> : null}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Recent Locations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Locations</Text>
            {RECENT_LOCATIONS.map((item, i) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.resultRow, i === RECENT_LOCATIONS.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.7}>
                <Text style={styles.resultClock}>🕐</Text>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultAddr}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmBtn, (!isReady || confirming) && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={!isReady || confirming}>
          <Text style={styles.confirmBtnText}>
            {confirming
              ? 'Please wait...'
              : type === 'pickup'
                ? 'Confirm Pickup Location'
                : 'Confirm Drop-off Location'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.secondary,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '600', includeFontPadding: false },
  headerTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: Colors.white, includeFontPadding: false },

  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 20 },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent',
  },
  inputBoxActive: { borderColor: Colors.secondary, backgroundColor: Colors.white },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  inputText: { flex: 1, fontSize: 14, color: Colors.textDark, padding: 0 },
  loadingRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: Colors.textGray },

  chooseOnMapRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 13, marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  chooseOnMapPin: { fontSize: 17 },
  chooseOnMapText: { fontSize: 14, fontWeight: '600', color: Colors.secondary },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textGray, letterSpacing: 0.5, marginBottom: 4 },

  resultRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 10,
  },
  resultPin: { fontSize: 18, marginTop: 1 },
  resultClock: { fontSize: 18, marginTop: 1 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 2 },
  resultAddr: { fontSize: 12, color: Colors.textGray, lineHeight: 17 },

  bottomBar: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  confirmBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    elevation: 2, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default SetLocationScreen;
