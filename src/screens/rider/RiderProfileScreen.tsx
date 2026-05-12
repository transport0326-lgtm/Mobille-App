import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { deleteAccount } from '../../redux/sagas/deleteAccountAction';
import { resetDeleteAccount } from '../../redux/slices/deleteAccountSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { clearToken } from '../../utils/tokenStorage';

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatEarnings = (amount: number): string => {
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

type Props = Record<string, never>;

type MenuItem = {
  id: string;
  icon: any;
  label: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'edit',
    icon: require('../../assets/icons/edit.png'),
    label: 'Edit Profile',
  },
  // {
  //   id: 'vehicle',
  //   icon: require('../../assets/icons/vehicle.png'),
  //   label: 'Vehicle Details',
  // },
  {
    id: 'docs',
    icon: require('../../assets/icons/documents.png'),
    label: 'Documents & KYC',
  },
  {
    id: 'bank',
    icon: require('../../assets/icons/bank.png'),
    label: 'Bank & Payment Details',
  },
  {
    id: 'delete',
    icon: require('../../assets/icons/delete.png'),
    label: 'Delete Account',
  },
  {
    id: 'help',
    icon: require('../../assets/icons/help.png'),
    label: 'Help & Support',
  },
];

const RiderProfileScreen: React.FC<Props> = () => {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const { data, loading } = useSelector((state: RootState) => state.riderProfile);
  const rider = data?.rider;
  const stats = data?.stats;

  const { loading: deleting, success: deleteSuccess, error: deleteError } =
    useSelector((state: RootState) => state.deleteAccount);

  const riderActiveBooking = useSelector((state: RootState) => state.riderActive.data?.booking);
  const hasActiveBooking = !!riderActiveBooking && !['completed', 'cancelled'].includes(riderActiveBooking.status);

  const handleLogout = async () => {
    await clearToken();
    rootNavigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  React.useEffect(() => {
    if (deleteSuccess) {
      dispatch(resetDeleteAccount());
      handleLogout();
    }
  }, [deleteSuccess]);

  React.useEffect(() => {
    if (deleteError) {
      Alert.alert('Error', deleteError);
      dispatch(resetDeleteAccount());
    }
  }, [deleteError]);

  // const handleMenuPress = (id: string) => {
  //   if (id === 'edit') navigation.navigate('RiderEditProfile');
  //   // if (id === 'vehicle') navigation.navigate('VehicleDetails');
  //   if (id === 'docs') navigation.navigate('DocumentsKYC');
  //   if (id === 'help') navigation.navigate('HelpSupport');
  //   if (id === 'bank') navigation.navigate('RiderBankPayment');
  //   if (id === 'delete') setShowDeleteModal(true);
  // };
  const handleMenuPress = (id: string) => {
  if (id === 'edit') rootNavigation.navigate('RiderEditProfile');
  if (id === 'docs') rootNavigation.navigate('DocumentsKYC');
  if (id === 'help') rootNavigation.navigate('HelpSupport');
  if (id === 'bank') rootNavigation.navigate('RiderBankPayment');
  if (id === 'delete') setShowDeleteModal(true);
};

  return (
    <View style={styles.safeArea}>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.white} style={{ marginBottom: 8 }} />
          ) : (
            <>
              {rider?.profilePhotoUrl ? (
                <Image source={{ uri: rider.profilePhotoUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{rider?.name ? getInitials(rider.name) : '?'}</Text>
                </View>
              )}
              <Text style={styles.name}>{rider?.name || '—'}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={!rider?.phone}
                onPress={() => rider?.phone && Linking.openURL(`tel:${rider.phone}`)}>
                <Text style={styles.phone}>{rider?.phone ? `+91 ${rider.phone}` : '—'}</Text>
              </TouchableOpacity>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ 4.8 Rating</Text>
              </View>
            </>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.totalTrips ?? '—'}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.lifetimeEarnings != null ? formatEarnings(stats.lifetimeEarnings) : '—'}
            </Text>
            <Text style={styles.statLabel}>Lifetime Earn</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.completionRate != null ? `${stats.completionRate}%` : '—'}
            </Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        {/* Vehicle Details Summary */}
        <View style={styles.vehicleCard}>
          {/* <Text style={styles.vehicleTitle}>🚲  Vehicle Details</Text> */}
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleKey}>Type</Text>
            <Text style={styles.vehicleValue}>
              {rider?.vehicleType ? rider.vehicleType.charAt(0).toUpperCase() + rider.vehicleType.slice(1) : '—'}
            </Text>
          </View>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleKey}>Registration</Text>
            <Text style={styles.vehicleValue}>{rider?.vehicleNumber ?? '—'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, index) => {
            const isDisabled = item.id === 'delete' && hasActiveBooking;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
                  isDisabled && styles.menuItemDisabled,
                ]}
                onPress={() => handleMenuPress(item.id)}
                activeOpacity={0.7}
                disabled={isDisabled}>
                <Image source={item.icon} style={[styles.menuIcon, isDisabled && styles.menuIconDisabled]} />
                <Text style={[styles.menuLabel, isDisabled && styles.menuLabelDisabled]}>
                  {item.label}
                </Text>
                <Text style={styles.chevron}>{'›'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Log Out */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>

              {/* Warning icon */}
              <View style={styles.modalIconCircle}>
                <Text style={styles.modalIconEmoji}>⚠️</Text>
              </View>

              <Text style={styles.modalTitle}>Delete Account?</Text>
              <Text style={styles.modalDesc}>This action is permanent and cannot be undone.</Text>

              {/* Bullet list */}
              <View style={styles.bulletList}>
                {[
                  'All your trip history & earnings data',
                  'Pending payouts (₹2,450)',
                  'Your verified rider status',
                  'Ratings & reviews (4.8 ★)',
                ].map((item, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Reason input */}
              <Text style={styles.reasonLabel}>Reason for leaving (optional)</Text>
              <TextInput
                style={styles.reasonInput}
                value={deleteReason}
                onChangeText={setDeleteReason}
                placeholder="Tell us why you're leaving..."
                placeholderTextColor="#BBBBBB"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Buttons */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                  onPress={() => { setShowDeleteModal(false); setDeleteReason(''); }}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  activeOpacity={0.85}
                  disabled={deleting}
                  onPress={() => {
                    setShowDeleteModal(false);
                    setDeleteReason('');
                    dispatch(deleteAccount({ type: 'rider' }));
                  }}>
                  {deleting
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.deleteBtnText}>Delete</Text>}
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2E407A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: Colors.white },
  name: { fontSize: 18, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  phone: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10, textDecorationLine: 'underline' },
  ratingBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  ratingText: { fontSize: 13, fontWeight: '700', color: Colors.white },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
  statLabel: { fontSize: 11, color: Colors.textGray, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#EEEEEE', marginVertical: 4 },

  // Vehicle card
  vehicleCard: {
    backgroundColor: Colors.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  vehicleKey: { fontSize: 13, color: Colors.textGray },
  vehicleValue: { fontSize: 13, fontWeight: '700', color: Colors.textDark },

  // Menu
  menu: { backgroundColor: Colors.white, marginTop: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
  },
  menuIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginRight: 10,
  },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textDark, fontWeight: '500' },
  menuItemDisabled: { opacity: 0.4 },
  menuIconDisabled: { tintColor: Colors.textGray },
  menuLabelDisabled: { color: Colors.textGray },
  chevron: { fontSize: 20, color: Colors.textGray, lineHeight: 22 },

  // Logout
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
    backgroundColor: Colors.white,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: Colors.primary },

  // Delete Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 14,
  },
  modalIconEmoji: { fontSize: 26 },
  modalTitle: {
    fontSize: 20, fontWeight: '800', color: '#DC2626',
    textAlign: 'center', marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13, color: Colors.textGray,
    textAlign: 'center', marginBottom: 16,
  },
  bulletList: { marginBottom: 18 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { fontSize: 13, color: '#DC2626', lineHeight: 20 },
  bulletText: { flex: 1, fontSize: 13, color: Colors.textDark, lineHeight: 20 },
  reasonLabel: { fontSize: 12, color: Colors.textGray, marginBottom: 6 },
  reasonInput: {
    borderWidth: 1, borderColor: Colors.borderGray, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: Colors.textDark,
    minHeight: 72, marginBottom: 20,
  },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.borderGray,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  deleteBtn: {
    flex: 1, backgroundColor: '#DC2626',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  deleteBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

});

export default RiderProfileScreen;
