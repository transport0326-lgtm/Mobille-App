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
  Dimensions,
  Image,
  PanResponder,
  Animated,
  TextInput,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import {
  type Suggestion,
  getTileUrl,
  forwardGeocode,
  reverseGeocode,
  searchSuggestions,
} from '../../utils/mapProviders';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MapPicker'>;
  route: RouteProp<RootStackParamList, 'MapPicker'>;
};

// ─── Tile math ────────────────────────────────────────────────────────────────

const ZOOM      = 15;
const TILE_SIZE = 256;

interface LatLng   { lat: number; lng: number }
interface PixelPos { px: number; py: number }

function latLngToFracTile(lat: number, lng: number, z: number) {
  const n  = Math.pow(2, z);
  const fx = ((lng + 180) / 360) * n;
  const fy =
    (1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
    2 * n;
  return { fx, fy };
}

function fracTileToPixel(fx: number, fy: number): PixelPos {
  return { px: fx * TILE_SIZE, py: fy * TILE_SIZE };
}

function pixelToLatLng(px: number, py: number, z: number): LatLng {
  const n   = Math.pow(2, z);
  const lng = (px / TILE_SIZE / n) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * py) / TILE_SIZE / n))) * 180) / Math.PI;
  return { lat, lng };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const GRID = 5;
const HALF = Math.floor(GRID / 2);
const DEFAULT_CENTER: LatLng = { lat: 22.5726, lng: 88.3639 }; // Kolkata

// ─── Component ───────────────────────────────────────────────────────────────

const MapPickerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { type, currentPickup, currentDropoff } = route.params;

  const [mapH, setMapH]     = useState(400);
  const [headerH, setHeaderH] = useState(0);
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [address, setAddress]   = useState('Move map to select location');
  const [isMoving, setIsMoving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchText, setSearchText]   = useState('Move map to select location');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const isSearchFocusedRef = useRef(false);

  const [suggestions, setSuggestions]               = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pan     = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dragRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setAddress('Fetching address...');
    reverseGeocode(center.lat, center.lng).then(setAddress);
  }, []);

  useEffect(() => {
    if (!isSearchFocusedRef.current) setSearchText(address);
  }, [address]);

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

    if (item.lat != null && item.lng != null) {
      pan.setValue({ x: 0, y: 0 });
      setCenter({ lat: item.lat, lng: item.lng });
      setAddress('Fetching address...');
      reverseGeocode(item.lat, item.lng).then(setAddress);
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
      pan.setValue({ x: 0, y: 0 });
      setCenter(coords);
      const result = await reverseGeocode(coords.lat, coords.lng);
      setAddress(result);
    } else {
      Alert.alert('Not Found', 'No location found for that address.');
      const restored = await reverseGeocode(center.lat, center.lng);
      setAddress(restored);
    }
    setIsGeocoding(false);
  };

  // ── Tile grid ───────────────────────────────────────────────────────────────

  const getTileGridStyle = () => {
    const { fx, fy } = latLngToFracTile(center.lat, center.lng, ZOOM);
    const { px: cpx, py: cpy } = fracTileToPixel(fx, fy);
    const originTX = Math.floor(fx) - HALF;
    const originTY = Math.floor(fy) - HALF;
    const { px: opx, py: opy } = fracTileToPixel(originTX, originTY);
    const left = SCREEN_W / 2 - (cpx - opx);
    const top  = mapH / 2    - (cpy - opy);
    return { left, top, originTX, originTY };
  };

  const { left, top, originTX, originTY } = getTileGridStyle();

  // ── PanResponder ────────────────────────────────────────────────────────────

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
        setSuggestions([]);
        setIsMoving(true);
      },
      onPanResponderMove: (_, gs) => {
        dragRef.current = { x: gs.dx, y: gs.dy };
        pan.setValue({ x: gs.dx, y: gs.dy });
      },
      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        const { fx, fy }           = latLngToFracTile(center.lat, center.lng, ZOOM);
        const { px: cpx, py: cpy } = fracTileToPixel(fx, fy);
        const newCenter = pixelToLatLng(cpx - gs.dx, cpy - gs.dy, ZOOM);
        pan.setValue({ x: 0, y: 0 });
        setCenter(newCenter);
        setIsMoving(false);
        setAddress('Fetching address...');
        reverseGeocode(newCenter.lat, newCenter.lng).then(setAddress);
      },
    }),
  ).current;

  // ── Use current location ────────────────────────────────────────────────────

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
        async pos => {
          const newCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(newCenter);
          pan.setValue({ x: 0, y: 0 });
          setAddress('Fetching address...');
          reverseGeocode(newCenter.lat, newCenter.lng).then(addr => {
            setAddress(addr);
            setLocating(false);
          });
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

  // ── Confirm ─────────────────────────────────────────────────────────────────

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
        pickupLat:  center.lat,
        pickupLng:  center.lng,
        dropoffLat: route.params.dropoffLat,
        dropoffLng: route.params.dropoffLng,
      });
    } else {
      navigation.navigate('SetLocation', {
        type: 'dropoff',
        currentPickup,
        currentDropoff: address,
        dropoffLat: center.lat,
        dropoffLng: center.lng,
        pickupLat:  route.params.pickupLat,
        pickupLng:  route.params.pickupLng,
      });
    }
  }, [address, type, currentPickup, currentDropoff, center, route.params]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const tiles: { key: string; tx: number; ty: number; col: number; row: number }[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      tiles.push({ key: `${originTX + col}_${originTY + row}`, tx: originTX + col, ty: originTY + row, col, row });
    }
  }

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
              if (searchText === 'Move map to select location' || searchText === 'Fetching address...') {
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
                  style={[styles.suggestionRow, i === suggestions.length - 1 && { borderBottomWidth: 0 }]}
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

      {/* Map */}
      <View
        style={styles.mapContainer}
        onLayout={e => setMapH(e.nativeEvent.layout.height)}
        {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.tileGrid,
            {
              left:   Animated.add(new Animated.Value(left), pan.x),
              top:    Animated.add(new Animated.Value(top),  pan.y),
              width:  GRID * TILE_SIZE,
              height: GRID * TILE_SIZE,
            },
          ]}
          pointerEvents="none">
          {tiles.map(({ key, tx, ty, col, row }) => (
            <Image
              key={key}
              source={{ uri: getTileUrl(ZOOM, tx, ty) }}
              style={[styles.tile, { left: col * TILE_SIZE, top: row * TILE_SIZE }]}
              resizeMode="cover"
            />
          ))}
        </Animated.View>

        {/* Center pin */}
        <View style={styles.pinContainer} pointerEvents="none">
          <View style={styles.pinWrapper}>
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
          </View>
          <View style={styles.pinShadow} />
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12,
    backgroundColor: Colors.secondary,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow:   { fontSize: 20, color: Colors.white, fontWeight: '700', includeFontPadding: false },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 14, marginBottom: 10,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4,
    gap: 10,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textDark, fontWeight: '500', padding: 0 },
  clearIcon:   { fontSize: 14, color: Colors.textGray, fontWeight: '700' },

  suggestionsDropdown: {
    position: 'absolute', left: 0, right: 0, zIndex: 30,
    backgroundColor: Colors.white, maxHeight: 260,
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 6,
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
  },
  suggestionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  suggestionPin:  { fontSize: 16 },
  suggestionName: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  suggestionAddr: { fontSize: 12, color: Colors.textGray, marginTop: 2 },

  mapContainer: { flex: 1, width: SCREEN_W, overflow: 'hidden', position: 'relative' },
  tileGrid:     { position: 'absolute' },
  tile:         { position: 'absolute', width: TILE_SIZE, height: TILE_SIZE },

  pinContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  pinWrapper: { alignItems: 'center', marginBottom: 10 },
  pinHead: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4,
  },
  pinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.white },
  pinTail: {
    width: 3, height: 14, backgroundColor: Colors.primary,
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },
  pinShadow: {
    width: 12, height: 5, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)', marginTop: -2,
  },

  currentLocBtn: {
    position: 'absolute', bottom: 14, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
    minWidth: 200, justifyContent: 'center',
  },
  currentLocDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: 'rgba(34,197,94,0.3)',
  },
  currentLocText: { fontSize: 14, fontWeight: '600', color: Colors.textDark },

  bottomPanel: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 6,
  },
  addressRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  pinIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF0EB', alignItems: 'center', justifyContent: 'center',
  },
  pinIconText:  { fontSize: 18 },
  addressInfo:  { flex: 1 },
  addressLabel: { fontSize: 11, fontWeight: '700', color: Colors.textGray, letterSpacing: 0.4, marginBottom: 3 },
  addressText:  { fontSize: 14, fontWeight: '600', color: Colors.textDark, lineHeight: 20 },

  confirmBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
    elevation: 2, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText:     { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default MapPickerScreen;
