import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  PermissionsAndroid,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import {
  type Suggestion,
  reverseGeocode,
  forwardGeocode,
  searchSuggestions,
  getPlaceCoords,
} from '../../utils/mapProviders';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MapPicker'>;
  route: RouteProp<RootStackParamList, 'MapPicker'>;
};

const DEFAULT_LAT = 22.5726;
const DEFAULT_LNG = 88.3639;
const DELTA = 0.015;

const MapPickerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { type, currentPickup, currentDropoff } = route.params;

  const initialLat =
    type === 'pickup'
      ? (route.params.pickupLat ?? DEFAULT_LAT)
      : (route.params.dropoffLat ?? DEFAULT_LAT);
  const initialLng =
    type === 'pickup'
      ? (route.params.pickupLng ?? DEFAULT_LNG)
      : (route.params.dropoffLng ?? DEFAULT_LNG);

  const mapRef = useRef<MapView>(null);
  const [centerCoords, setCenterCoords] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState('Move map to select location');
  const [isMoving, setIsMoving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const isSearchFocusedRef = useRef(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [headerH, setHeaderH] = useState(0);

  // Fetch address for the initial map position
  useEffect(() => {
    setAddress('Fetching address...');
    reverseGeocode(initialLat, initialLng).then(setAddress);
  }, []);

  // Keep search bar text in sync with address when not focused
  useEffect(() => {
    if (!isSearchFocusedRef.current) setSearchText(address);
  }, [address]);

  const moveTo = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: DELTA, longitudeDelta: DELTA },
      500,
    );
    setCenterCoords({ lat, lng });
  };

  const fetchMapSuggestions = async (query: string) => {
    setSuggestionsLoading(true);
    try {
      setSuggestions(await searchSuggestions(query));
    } catch {
      setSuggestions([]);
    }
    setSuggestionsLoading(false);
  };

  const handleSuggestionSelect = async (item: Suggestion) => {
    setSuggestions([]);
    isSearchFocusedRef.current = false;
    setSearchText(item.address ? `${item.name}, ${item.address}` : item.name);

    let lat = item.lat;
    let lng = item.lng;

    if (lat == null || lng == null) {
      const coords = await getPlaceCoords(item.id);
      if (coords) { lat = coords.lat; lng = coords.lng; }
    }

    if (lat != null && lng != null) {
      setAddress('Fetching address...');
      moveTo(lat, lng);
    }
  };

  const handleSearchSubmit = async () => {
    const query = searchText.trim();
    if (!query || query === 'Move map to select location' || query === 'Fetching address...') return;
    setSuggestions([]);
    isSearchFocusedRef.current = false;
    setIsGeocoding(true);
    setAddress('Fetching address...');
    const coords = await forwardGeocode(query);
    if (coords) {
      moveTo(coords.lat, coords.lng);
    } else {
      Alert.alert('Not Found', 'No location found for that address.');
      const restored = await reverseGeocode(centerCoords.lat, centerCoords.lng);
      setAddress(restored);
    }
    setIsGeocoding(false);
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setLocating(false);
          return;
        }
      }
      Geolocation.getCurrentPosition(
        pos => {
          setAddress('Fetching address...');
          moveTo(pos.coords.latitude, pos.coords.longitude);
          setLocating(false);
        },
        () => {
          Alert.alert('Error', 'Could not detect location.');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    } catch {
      setLocating(false);
    }
  };

  // Auto-place pin at current GPS location when no coords were passed via route params
  const hasRouteCoords =
    type === 'pickup'
      ? route.params.pickupLat != null && route.params.pickupLng != null
      : route.params.dropoffLat != null && route.params.dropoffLng != null;

  useEffect(() => {
    if (!hasRouteCoords) handleUseCurrentLocation();
  }, []);

  const canConfirm =
    !isMoving &&
    address !== 'Move map to select location' &&
    address !== 'Fetching address...';

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    if (type === 'pickup') {
      navigation.navigate('SetLocation', {
        type: 'pickup',
        currentPickup: address,
        currentDropoff,
        pickupLat: centerCoords.lat,
        pickupLng: centerCoords.lng,
        dropoffLat: route.params.dropoffLat,
        dropoffLng: route.params.dropoffLng,
      });
    } else {
      navigation.navigate('SetLocation', {
        type: 'dropoff',
        currentPickup,
        currentDropoff: address,
        dropoffLat: centerCoords.lat,
        dropoffLng: centerCoords.lng,
        pickupLat: route.params.pickupLat,
        pickupLng: route.params.pickupLng,
      });
    }
  }, [address, type, currentPickup, currentDropoff, centerCoords, route.params]);

  const handleRegionChange = (_r: Region) => {
    if (!isMoving) setIsMoving(true);
  };

  const handleRegionChangeComplete = (r: Region) => {
    setIsMoving(false);
    setCenterCoords({ lat: r.latitude, lng: r.longitude });
    setAddress('Fetching address...');
    reverseGeocode(r.latitude, r.longitude).then(setAddress);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <SafeAreaView
        edges={['top']}
        style={styles.headerSafe}
        onLayout={e => setHeaderH(e.nativeEvent.layout.height)}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Address</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchBar}>
          {isGeocoding ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 2 }} />
          ) : (
            <Text style={styles.searchIcon}>🔍</Text>
          )}
          <TextInput
            style={[styles.searchInput, (isMoving || isGeocoding) && { color: '#AAAAAA' }]}
            value={isMoving ? 'Moving...' : searchText}
            onChangeText={text => {
              setSearchText(text);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              if (text.trim().length > 1) {
                debounceRef.current = setTimeout(() => fetchMapSuggestions(text), 350);
              } else {
                setSuggestions([]);
              }
            }}
            onFocus={() => {
              isSearchFocusedRef.current = true;
              if (
                searchText === 'Move map to select location' ||
                searchText === 'Fetching address...'
              ) {
                setSearchText('');
              }
            }}
            onBlur={() => { isSearchFocusedRef.current = false; }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            placeholder="Type an address…"
            placeholderTextColor="#AAAAAA"
            editable={!isMoving && !isGeocoding}
          />
          {!isMoving && !isGeocoding && searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('Move map to select location');
                setAddress('Move map to select location');
                setSuggestions([]);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Search suggestions */}
      {(suggestionsLoading || suggestions.length > 0) && (
        <View style={[styles.suggestionsDropdown, { top: headerH }]}>
          {suggestionsLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 14 }} />
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
              {suggestions.map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.suggestionRow,
                    i === suggestions.length - 1 && { borderBottomWidth: 0 },
                  ]}
                  onPress={() => handleSuggestionSelect(item)}
                  activeOpacity={0.7}>
                  <Text style={styles.suggestionPin}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
                    {!!item.address && (
                      <Text style={styles.suggestionAddr} numberOfLines={1}>{item.address}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Google Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: initialLat,
            longitude: initialLng,
            latitudeDelta: DELTA,
            longitudeDelta: DELTA,
          }}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={true}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
          mapType="standard"
        />

        {/* Fixed center pin — stays static while map moves beneath it */}
        <View style={styles.pinContainer} pointerEvents="none">
          {/* translateY: -54 shifts up so tip (bottom of tail) sits at exact map center */}
          <View style={styles.pinGroup}>
            {isMoving ? (
              <View style={[styles.pinHead, { backgroundColor: Colors.secondary }]}>
                <ActivityIndicator size="small" color={Colors.white} />
              </View>
            ) : (
              <View style={styles.pinHead}>
                <View style={styles.pinDot} />
              </View>
            )}
            <View style={styles.pinTail} />
            <View style={styles.pinShadow} />
          </View>
        </View>

        {/* Use Current Location */}
        <TouchableOpacity
          style={styles.currentLocBtn}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.85}
          disabled={locating}>
          {locating ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <View style={styles.currentLocDot} />
              <Text style={styles.currentLocText}>Use Current Location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      <SafeAreaView edges={['bottom']} style={styles.bottomPanel}>
        <View style={styles.addressRow}>
          <View style={styles.pinIconCircle}>
            <Text style={styles.pinIconText}>📍</Text>
          </View>
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>
              {type === 'pickup' ? 'Pickup Location' : 'Drop-off Location'}
            </Text>
            <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={!canConfirm}>
          <Text style={styles.confirmBtnText}>Confirm Location</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  headerSafe: { backgroundColor: Colors.secondary, zIndex: 10, elevation: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: Colors.secondary,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow:   { fontSize: 20, color: Colors.white, fontWeight: '700', includeFontPadding: false },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    gap: 10,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textDark, fontWeight: '500', padding: 0 },
  clearIcon:   { fontSize: 14, color: Colors.textGray, fontWeight: '700' },

  suggestionsDropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: Colors.white,
    maxHeight: 260,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionPin:  { fontSize: 16 },
  suggestionName: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  suggestionAddr: { fontSize: 12, color: Colors.textGray, marginTop: 2 },

  mapContainer: { flex: 1 },
  map:          { flex: 1 },

  pinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinGroup: { alignItems: 'center', transform: [{ translateY: -54 }] },
  pinHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  pinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.white },
  pinTail: {
    width: 3,
    height: 14,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  pinShadow: {
    width: 12,
    height: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: -2,
  },

  currentLocBtn: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    minWidth: 200,
    justifyContent: 'center',
  },
  currentLocDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  currentLocText: { fontSize: 14, fontWeight: '600', color: Colors.textDark },

  bottomPanel: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  addressRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  pinIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIconText:  { fontSize: 18 },
  addressInfo:  { flex: 1 },
  addressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textGray,
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  addressText: { fontSize: 14, fontWeight: '600', color: Colors.textDark, lineHeight: 20 },

  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText:     { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default MapPickerScreen;
