import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RouteProp } from '@react-navigation/native';
import type { RootState } from '../../redux/store';
import { ActivityIndicator, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput as RNTextInput,
  PermissionsAndroid,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import Contacts, { Contact } from 'react-native-contacts';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { fareEstimate } from '../../redux/sagas/booking/fareEstimateAction';
import { createBooking } from '../../redux/sagas/booking/createBookingAction';
import { trackBooking } from '../../redux/sagas/booking/trackBookingAction';
import { resetBooking, resetTrackBooking } from '../../redux/slices/bookingSlice';
import { fetchProfile } from '../../redux/sagas/profile/profileAction';
import { clearToken, loadActiveBooking, clearActiveBooking } from '../../utils/tokenStorage';
import type { AppDispatch } from '../../redux/store';
import AppHeader from '../../components/AppHeader';
import OngoingDeliveryBanner from '../../components/OngoingDeliveryBanner';
import MyOrdersScreen from './MyOrdersScreen';
import NotificationsScreen from '../shared/NotificationsScreen';
import ProfileScreen from './ProfileScreen';
import { Dimensions } from 'react-native';

type CustomerDashboardProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CustomerDashboard'>;
  route: RouteProp<RootStackParamList, 'CustomerDashboard'>;
};

type Vehicle = {
  id: string;
  emoji: string;
  name: string;
  capacity: string;
  fareMin: number;
  fareMax: number;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 4;

const VEHICLES: Vehicle[] = [
  { id: 'bike', emoji: '🏍️', name: 'Bike', capacity: 'Up to 20 kg', fareMin: 45, fareMax: 60 },
  { id: 'auto', emoji: '🛺', name: 'Auto', capacity: 'Up to 50 kg', fareMin: 70, fareMax: 90 },
  { id: 'miniTruck', emoji: '🚚', name: 'Mini Truck', capacity: 'Up to 200 kg', fareMin: 150, fareMax: 200 },
  { id: 'truck', emoji: '🚛', name: 'Truck', capacity: 'Up to 1000 kg', fareMin: 400, fareMax: 600 },
];

type TabName = 'Home' | 'Orders' | 'Alerts' | 'Profile';

const TAB_ITEMS: { name: TabName; emoji: string }[] = [
  { name: 'Home', emoji: '🏠' },
  { name: 'Orders', emoji: '📦' },
  { name: 'Alerts', emoji: '🔔' },
  { name: 'Profile', emoji: '👤' },
];

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading: fareLoading, data: fareData, error: fareError } = useSelector(
    (state: RootState) => state.booking.fareEstimate,
  );

  const [pickup, setPickup] = useState(route.params?.confirmedPickup || '');
  const [dropoff, setDropoff] = useState(route.params?.confirmedDropoff || '');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('bike');

  // Coords come from Redux — SetLocationScreen dispatches them on confirm
  const { pickupLat, pickupLng, dropoffLat, dropoffLng } = useSelector(
    (state: RootState) => state.booking.coords,
  );

  const customerName = useSelector(
    (state: RootState) =>
      (state.profile.data as any)?.name ??
      (state.profile.data as any)?.user?.name ??
      'Customer',
  );

  const { loading: bookingLoading, data: bookingData, error: bookingError } = useSelector(
    (state: RootState) => state.booking.createBooking,
  );

  // Sync address labels when returning from SetLocation
  useEffect(() => {
    const p = route.params;
    if (!p) return;
    if (p.confirmedPickup != null) setPickup(p.confirmedPickup);
    if (p.confirmedDropoff != null) setDropoff(p.confirmedDropoff);
  }, [route.params]);
  // Existing useState ke neeche yeh add karo
  useEffect(() => {
    if (route.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route.params?.tab]);

  // Fires whenever coords change in Redux (e.g. returning from SetLocationScreen).
  useEffect(() => {
    console.log('[Dashboard] coords changed —', { pickupLat, pickupLng, dropoffLat, dropoffLng }, 'vehicle:', selectedVehicle);
    if (pickupLat == null || pickupLng == null || dropoffLat == null || dropoffLng == null) {
      console.log('[Dashboard] coords incomplete, skipping fare estimate');
      return;
    }
    console.log('[Dashboard] dispatching fareEstimate on coord change');
    dispatch(fareEstimate({ pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType: selectedVehicle }));
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  // Re-fires when the user picks a different vehicle while the screen is already focused.
  const isFirstVehicleRender = React.useRef(true);
  useEffect(() => {
    if (isFirstVehicleRender.current) { isFirstVehicleRender.current = false; return; }
    console.log('[Dashboard] vehicle changed to', selectedVehicle, '— dispatching fareEstimate');
    if (pickupLat == null || pickupLng == null || dropoffLat == null || dropoffLng == null) return;
    dispatch(fareEstimate({ pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType: selectedVehicle }));
  }, [selectedVehicle]);


  const [parcelDetails, setParcelDetails] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [activeTab, setActiveTab] = useState<TabName>(route.params?.tab || 'Home');

  const [contactsVisible, setContactsVisible] = useState(false);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);

  // Active booking tracking
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const customerPollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const trackData = useSelector((state: RootState) => state.booking.trackBooking.data);
  const skipRestore = useSelector((state: RootState) => state.booking.skipRestore);
  const skipRestoreRef = React.useRef(false);
  skipRestoreRef.current = skipRestore;

  useEffect(() => {
    dispatch(fetchProfile());
  }, []);

  useEffect(() => {
    if (activeTab === 'Profile') {
      dispatch(fetchProfile());
    }
  }, [activeTab]);

  // Load persisted active booking on mount and start polling
  useEffect(() => {
    if (skipRestoreRef.current) return;
    loadActiveBooking().then(id => {
      if (!id) return;
      setActiveBookingId(id);
      dispatch(trackBooking({ bookingId: id }));
    });
    return () => {
      if (customerPollRef.current) clearInterval(customerPollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeBookingId) return;
    customerPollRef.current = setInterval(() => {
      dispatch(trackBooking({ bookingId: activeBookingId }));
    }, 5000);
    return () => {
      if (customerPollRef.current) { clearInterval(customerPollRef.current); customerPollRef.current = null; }
    };
  }, [activeBookingId]);

  // Stop tracking when booking reaches a terminal state
  useEffect(() => {
    const status = trackData?.booking?.status;
    if (!status) return;
    if (['completed', 'delivered', 'cancelled'].includes(status)) {
      clearActiveBooking();
      setActiveBookingId(null);
      if (customerPollRef.current) { clearInterval(customerPollRef.current); customerPollRef.current = null; }
      dispatch(resetTrackBooking());
    }
  }, [trackData?.booking?.status]);

  const openContacts = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          { title: 'Contacts Permission', message: 'Allow access to select a receiver from your contacts.', buttonPositive: 'Allow' },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Contacts permission is required to use this feature.');
          return;
        }
      }
      setContactsLoading(true);
      setContactsVisible(true);
      setContactSearch('');
      const contacts = await Contacts.getAll();
      const withPhone = contacts.filter(c => c.phoneNumbers?.length > 0);
      withPhone.sort((a, b) => (a.givenName ?? '').localeCompare(b.givenName ?? ''));
      setAllContacts(withPhone);
    } catch {
      setContactsVisible(false);
    } finally {
      setContactsLoading(false);
    }
  };

  const selectContact = (contact: Contact) => {
    const name = [contact.givenName, contact.familyName].filter(Boolean).join(' ').trim();
    const rawPhone = contact.phoneNumbers?.[0]?.number ?? '';
    const phone = rawPhone.replace(/\D/g, '').slice(-10);
    if (name) setReceiverName(name);
    if (phone) setReceiverPhone(phone);
    setContactsVisible(false);
  };

  const filteredContacts = contactSearch.trim().length === 0
    ? allContacts
    : allContacts.filter(c => {
      const full = [c.givenName, c.familyName].filter(Boolean).join(' ').toLowerCase();
      return full.includes(contactSearch.toLowerCase());
    });

  const currentVehicle = VEHICLES.find(v => v.id === selectedVehicle)!;
  const isValidName = (name: string) => /^[A-Za-z ,]{3,}$/.test(name);
  const isValidPhone = (phone: string) => /^[0-9]{10}$/.test(phone);

  const isBookingReady =
    pickup.trim().length > 0 &&
    dropoff.trim().length > 0 &&
    receiverName.trim().length > 0 &&
    receiverPhone.trim().length > 0 &&
    isValidName(receiverName) &&
    isValidPhone(receiverPhone);

  const handleBookNow = () => {
    if (!isBookingReady) return;
    if (pickupLat == null || pickupLng == null || dropoffLat == null || dropoffLng == null) {
      Alert.alert('Location missing', 'Please select both pickup and drop-off locations from the location screen.');
      return;
    }
    dispatch(createBooking({
      pickupLocation: { address: pickup, coordinates: { lat: pickupLat, lng: pickupLng } },
      dropoffLocation: { address: dropoff, coordinates: { lat: dropoffLat, lng: dropoffLng } },
      vehicleType: selectedVehicle,
      receiverName,
      receiverPhone,
      ...(parcelDetails.trim() ? { parcelDetails: parcelDetails.trim() } : {}),
    }));
  };

  useEffect(() => {
    if (bookingLoading) return;
    if (!bookingData) return;

    const bookingId = bookingData?.booking?._id;

    // dispatch(resetCreateBooking());

    navigation.navigate('FindingRider', {
      pickup,
      dropoff,
      bookingId,
    });

  }, [bookingData, bookingLoading]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

      {activeTab === 'Orders' ? (
        <MyOrdersScreen onBack={() => setActiveTab('Home')} />
      ) : activeTab === 'Alerts' ? (
        <NotificationsScreen onBack={() => setActiveTab('Home')} />
      ) : activeTab === 'Profile' ? (
        <ProfileScreen
          onLogout={() => {
            dispatch(resetBooking());
            clearToken();
            navigation.navigate('Login');
          }}
          onDeleteSuccess={() => {
            dispatch(resetBooking());
            clearToken();
            navigation.navigate('Login');
          }}
          onEditProfile={() => navigation.navigate('EditProfile')}
          onHelpSupport={() => navigation.navigate('HelpSupport')}
          onLanguage={() => navigation.navigate('Language')}
        />
      ) : (
        <>
          <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

          <AppHeader
            name={`${customerName} 👋`}
            subtitle="Where are you sending today?"
          />

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Pickup / Dropoff */}
            <View style={styles.locationCard}>
              <View style={styles.locationRow}>
                <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate('SetLocation', {
                    type: 'pickup',
                    currentPickup: pickup,
                    currentDropoff: dropoff,
                    vehicleType: selectedVehicle,
                    pickupLat: pickupLat ?? undefined,
                    pickupLng: pickupLng ?? undefined,
                    dropoffLat: dropoffLat ?? undefined,
                    dropoffLng: dropoffLng ?? undefined,
                  })}
                  activeOpacity={0.7}>
                  <RNTextInput
                    style={styles.locationInput}
                    placeholder="Enter pickup location"
                    placeholderTextColor="#AAAAAA"
                    value={pickup}
                    onChangeText={setPickup}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.locationDivider} />

              <View style={styles.locationRow}>
                <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate('SetLocation', {
                    type: 'dropoff',
                    currentPickup: pickup,
                    currentDropoff: dropoff,
                    vehicleType: selectedVehicle,
                    pickupLat: pickupLat ?? undefined,
                    pickupLng: pickupLng ?? undefined,
                    dropoffLat: dropoffLat ?? undefined,
                    dropoffLng: dropoffLng ?? undefined,
                  })}
                  activeOpacity={0.7}>
                  <RNTextInput
                    style={styles.locationInput}
                    placeholder="Enter drop-off location"
                    placeholderTextColor="#AAAAAA"
                    value={dropoff}
                    onChangeText={setDropoff}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Select Vehicle */}
            <Text style={styles.sectionTitle}>Select Vehicle</Text>
            <View style={styles.vehicleRow}>
              {VEHICLES.map(vehicle => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleCard,
                    selectedVehicle === vehicle.id && styles.vehicleCardActive,
                  ]}
                  onPress={() => setSelectedVehicle(vehicle.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
                  <Text
                    style={[
                      styles.vehicleName,
                      selectedVehicle === vehicle.id && styles.vehicleNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {vehicle.name}
                  </Text>

                  <Text
                    style={[
                      styles.vehicleCapacity,
                      selectedVehicle === vehicle.id && styles.vehicleCapacityActive,
                    ]}
                    numberOfLines={2}
                  >
                    {vehicle.capacity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Fare Estimate */}
            <Text style={styles.sectionTitle}>Fare Estimate</Text>
            {fareLoading ? (
              <View style={styles.fareCard}>
                <Text style={styles.fareLabel}>Calculating fare…</Text>
                <ActivityIndicator size="small" color={Colors.secondary} />
              </View>
            ) : fareError ? (
              <View style={[styles.fareCard, styles.fareCardEmpty]}>
                <Text style={styles.fareErrorText}>{fareError}</Text>
              </View>
            ) : fareData ? (
              <View style={styles.fareCard}>
                <View>
                  <Text style={styles.fareLabel}>Estimated Fare ({currentVehicle.name})</Text>
                  {fareData.distanceKm != null && (
                    <Text style={styles.fareDistance}>{fareData.distanceKm.toFixed(1)} km</Text>
                  )}
                  {fareData.message ? (
                    <Text style={styles.fareMessage}>{fareData.message}</Text>
                  ) : null}
                </View>
                <Text style={styles.fareAmount}>
                  ₹{fareData.fare ?? fareData.total ?? '—'}
                </Text>
              </View>
            ) : (
              <View style={[styles.fareCard, styles.fareCardEmpty]}>
                <Text style={styles.fareEmptyText}>
                  Select pickup &amp; drop-off location to see fare estimate.
                </Text>
              </View>
            )}
            <Text style={styles.fareNote}>
              Final fare may vary based on distance and traffic.
            </Text>

            {/* Parcel Details */}
            <Text style={styles.sectionTitle}>Parcel Details (Optional)</Text>
            <View style={styles.inputBox}>
              <RNTextInput
                style={styles.inputText}
                placeholder="e.g., Documents, Food, Electronics..."
                placeholderTextColor="#AAAAAA"
                value={parcelDetails}
                onChangeText={setParcelDetails}
              />
            </View>

            {/* Receiver Details */}
            <View style={styles.receiverHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0, color: Colors.secondary }]}>
                Receiver Details
              </Text>
              <TouchableOpacity style={styles.contactsBtn} onPress={openContacts} activeOpacity={0.7}>
                <Ionicons name="person-circle-outline" size={16} color={Colors.secondary} />
                <Text style={styles.contactsBtnText}>Contacts</Text>
              </TouchableOpacity>
            </View>
            {/* Receiver Name */}
            <View style={styles.inputBox}>
              <Text style={styles.inputIcon}>👤</Text>
              <RNTextInput
                style={styles.inputText}
                placeholder="Receiver's full name"
                placeholderTextColor="#AAAAAA"
                value={receiverName}
                onChangeText={setReceiverName}
                autoCapitalize="words"
              />
              <TouchableOpacity onPress={openContacts} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="person-add-outline" size={18} color="#AAAAAA" />
              </TouchableOpacity>
            </View>
            {receiverName.length > 0 && !isValidName(receiverName) && (
              <Text style={{ color: 'red', marginTop: -10, marginBottom: 12 }}>
                Name must be at least 3 letters
              </Text>
            )}

            {/* Receiver Phone */}
            <View style={styles.inputBox}>
              <Text style={styles.inputIcon}>📱</Text>
              <Text style={styles.phonePrefix}>+91</Text>
              <RNTextInput
                style={styles.inputText}
                placeholder="Receiver's phone number"
                placeholderTextColor="#AAAAAA"
                value={receiverPhone}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setReceiverPhone(cleaned);
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {receiverPhone.length > 0 && !isValidPhone(receiverPhone) && (
              <Text style={{ color: 'red', marginTop: -10, marginBottom: 12 }}>
                Enter a valid 10-digit phone number
              </Text>
            )}

            {/* Book Now Button */}
            <TouchableOpacity
              style={[styles.bookBtn, (!isBookingReady || bookingLoading) && styles.bookBtnDisabled]}
              activeOpacity={0.85}
              disabled={!isBookingReady || bookingLoading}
              onPress={handleBookNow}>
              {bookingLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.bookBtnText}> Book Now →</Text>}
            </TouchableOpacity>
            {bookingError ? (
              <Text style={styles.bookingError}>{bookingError}</Text>
            ) : null}

            <View style={{ height: 16 }} />
          </ScrollView>
        </>
      )}

      {/* Ongoing Delivery Banner — visible on all tabs */}
      {(() => {
        const status = trackData?.booking?.status;
        if (!trackData || !status || !['pending', 'assigned', 'arrived_at_pickup', 'in_transit'].includes(status)) return null;
        return (
          <OngoingDeliveryBanner
            pickup={trackData.booking.pickupLocation?.address ?? ''}
            dropoff={trackData.booking.dropoffLocation?.address ?? ''}
            distanceKm={trackData.distanceKm}
            etaMinutes={trackData.etaMinutes}
            onPress={() => {
              if (status === 'pending') {
                navigation.navigate('FindingRider', {
                  pickup: trackData.booking.pickupLocation?.address ?? '',
                  dropoff: trackData.booking.dropoffLocation?.address ?? '',
                  bookingId: trackData.booking._id,
                });
              } else {
                navigation.navigate('BookingConfirmed', {
                  booking: trackData.booking,
                  rider: trackData.rider,
                });
              }
            }}
          />
        );
      })()}

      {/* Bottom Tab Bar — always visible */}
      <View style={styles.tabBar}>
        {TAB_ITEMS.map(tab => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.name)}
            activeOpacity={0.7}>
            {tab.name === 'Home'
              ? <Image
                source={require('../../assets/icons/riderHome.png')}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: activeTab === 'Home' ? Colors.primary : Colors.textGray,
                  resizeMode: 'contain'
                }}
              />
              : tab.name === 'Orders'
                ? <Image
                  source={require('../../assets/icons/orders.png')}
                  style={{
                    width: 22,
                    height: 22,
                    tintColor: activeTab === 'Orders' ? Colors.primary : Colors.textGray,
                    resizeMode: 'contain'
                  }}
                />
                : tab.name === 'Alerts'
                  ? <Image
                    source={require('../../assets/icons/notifications.png')}
                    style={{
                      width: 22,
                      height: 22,
                      tintColor: activeTab === 'Alerts' ? Colors.primary : Colors.textGray,
                      resizeMode: 'contain'
                    }}
                  />
                  : <Image
                    source={require('../../assets/icons/person.png')}
                    style={{
                      width: 22,
                      height: 22,
                      tintColor: activeTab === 'Profile' ? Colors.primary : Colors.textGray,
                      resizeMode: 'contain'
                    }}
                  />}
            <Text style={[
              styles.tabLabel,
              activeTab === tab.name && styles.tabLabelActive,
            ]}>
              {tab.name}
            </Text>
            {activeTab === tab.name && <View style={styles.tabActiveBar} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Contacts Picker Modal */}
      <Modal
        visible={contactsVisible}
        animationType="slide"
        onRequestClose={() => setContactsVisible(false)}>
        <View style={styles.contactsModal}>
          {/* Modal Header */}
          <View style={styles.contactsHeader}>
            <Text style={styles.contactsTitle}>Select Contact</Text>
            <TouchableOpacity onPress={() => setContactsVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.contactsSearch}>
            <Ionicons name="search-outline" size={18} color="#AAAAAA" />
            <RNTextInput
              style={styles.contactsSearchInput}
              placeholder="Search contacts..."
              placeholderTextColor="#AAAAAA"
              value={contactSearch}
              onChangeText={setContactSearch}
              autoCorrect={false}
            />
            {contactSearch.length > 0 && (
              <TouchableOpacity onPress={() => setContactSearch('')}>
                <Ionicons name="close-circle" size={18} color="#AAAAAA" />
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          {contactsLoading ? (
            <View style={styles.contactsCentered}>
              <ActivityIndicator size="large" color={Colors.secondary} />
              <Text style={styles.contactsLoadingText}>Loading contacts…</Text>
            </View>
          ) : filteredContacts.length === 0 ? (
            <View style={styles.contactsCentered}>
              <Text style={styles.contactsEmptyText}>No contacts found.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={item => item.recordID}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const name = [item.givenName, item.familyName].filter(Boolean).join(' ');
                const phone = item.phoneNumbers?.[0]?.number ?? '';
                return (
                  <TouchableOpacity style={styles.contactRow} onPress={() => selectContact(item)} activeOpacity={0.7}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactAvatarText}>{(item.givenName?.[0] ?? '?').toUpperCase()}</Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{name}</Text>
                      <Text style={styles.contactPhone}>{phone}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.contactDivider} />}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Location Card
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },
  locationDivider: {
    height: 1,
    backgroundColor: Colors.borderGray,
    marginLeft: 22,
  },

  // Section Title
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  receiverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contactsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.secondary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  contactsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  contactsModal: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: Colors.white,
  },
  contactsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  contactsSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  contactsSearchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    padding: 0,
  },
  contactsCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  contactsLoadingText: {
    fontSize: 14,
    color: Colors.textGray,
  },
  contactsEmptyText: {
    fontSize: 14,
    color: Colors.textGray,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  contactAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.secondary,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  contactPhone: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  contactDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 70,
  },

  // Vehicle
  vehicleScroll: {
    marginBottom: 20,
  },
  vehicleScrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  vehicleCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 95,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
  },
  vehicleCardActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  vehicleEmoji: {
    fontSize: 26,
  },
  vehicleName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
  vehicleNameActive: {
    color: Colors.white,
  },
  vehicleCapacity: {
    fontSize: 10,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 12,
  },
  vehicleCapacityActive: {
    color: 'rgba(255,255,255,0.8)',
  },

  // Fare
  fareCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 6,
  },
  fareLabel: {
    fontSize: 13,
    color: Colors.textGray,
  },
  fareErrorText: {
    fontSize: 13,
    color: 'red',
    textAlign: 'center',
    flex: 1,
  },
  fareMessage: {
    fontSize: 11,
    color: Colors.textGray,
    marginTop: 2,
  },
  fareDistance: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.secondary,
  },
  fareCardEmpty: {
    justifyContent: 'center',
  },
  fareEmptyText: {
    fontSize: 13,
    color: Colors.textGray,
    textAlign: 'center',
    flex: 1,
  },
  fareNote: {
    fontSize: 11,
    color: Colors.textGray,
    marginBottom: 20,
  },

  // Input Box
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 12,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  phonePrefix: {
    fontSize: 14,
    color: Colors.textDark,
    marginRight: 4,
    fontWeight: '600',
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },

  // Book Button
  bookBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookBtnDisabled: {
    opacity: 0.6,
  },
  bookBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookingError: {
    color: 'red',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGray,
    paddingBottom: 4,
    paddingTop: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.textGray,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  tabActiveBar: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 3,
    backgroundColor: Colors.secondary,
    borderRadius: 2,
  },

});

export default CustomerDashboard;
