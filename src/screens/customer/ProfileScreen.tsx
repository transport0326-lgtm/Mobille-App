import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { deleteAccount } from '../../redux/sagas/deleteAccountAction';
import { resetDeleteAccount } from '../../redux/slices/deleteAccountSlice';
import { Colors } from '../../theme/theme';

type MenuItem = {
  id: string;
  icon: any;
  label: string;
  danger?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'edit',
    icon: require('../../assets/icons/edit.png'),
    label: 'Edit Profile',
  },
  {
    id: 'delete',
    icon: require('../../assets/icons/delete.png'),
    label: 'Delete Account',
    danger: true,
  },
  {
    id: 'help',
    icon: require('../../assets/icons/help.png'),
    label: 'Help & Support',
  },
];

type ProfileScreenProps = {
  onLogout: () => void;
  onEditProfile: () => void;
  onHelpSupport: () => void;
  onLanguage: () => void;
  onDeleteSuccess: () => void;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onEditProfile,
  onHelpSupport,
  onLanguage,
  onDeleteSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, loading } = useSelector((state: RootState) => state.profile);
  const user = data?.user;

  const { loading: deleting, success: deleteSuccess, error: deleteError } =
    useSelector((state: RootState) => state.deleteAccount);

  React.useEffect(() => {
    if (deleteSuccess) {
      dispatch(resetDeleteAccount());
      onDeleteSuccess();
    }
  }, [deleteSuccess]);

  React.useEffect(() => {
    if (deleteError) {
      Alert.alert('Error', deleteError);
      dispatch(resetDeleteAccount());
    }
  }, [deleteError]);

  const handleMenuPress = (id: string) => {
    if (id === 'edit') return onEditProfile();
    if (id === 'help') return onHelpSupport();
    if (id === 'language') return onLanguage();
    if (id === 'delete') {
      setShowDeleteModal(true);
      return;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <View style={{ marginBottom: 16 }} />

      {/* Header */}
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.white} style={{ marginBottom: 8 }} />
        ) : (
          <>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user?.name ? getInitials(user.name) : '?'}</Text>
            </View>
            <Text style={styles.name}>{user?.name || '—'}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={!user?.phone}
              onPress={() => user?.phone && Linking.openURL(`tel:${user.phone}`)}>
              <Text style={styles.phone}>{user?.phone ? `+91 ${user.phone}` : '—'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
            ]}
            // ✅ FIX: Simple function call — koi inline ternary nahi
            onPress={() => handleMenuPress(item.id)}
            activeOpacity={0.7}>
            <Image source={item.icon} style={styles.menuIcon} />
            <Text style={[styles.menuLabel]}>
              {item.label}
            </Text>
            <Text style={styles.chevron}>{'›'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTrashIcon}>🗑️</Text>
            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalDesc}>
              This action is permanent and cannot be undone. All your data, bookings, and history will be permanently deleted.
            </Text>
            <View style={styles.modalWarning}>
              <Text style={styles.modalWarningIcon}>⚠️</Text>
              <Text style={styles.modalWarningText}>
                You will lose all saved addresses, booking history, and wallet balance.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              activeOpacity={0.85}
              disabled={deleting}
              onPress={() => {
                setShowDeleteModal(false);
                dispatch(deleteAccount({ type: 'user' }));
              }}>
              {deleting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.deleteBtnText}>Yes, Delete My Account</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.7}
              onPress={() => setShowDeleteModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Log Out */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
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
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'underline',
  },

  menu: {
    backgroundColor: Colors.white,
    marginTop: 12,
  },
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
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: '600',
  },
  menuLabelDanger: {
    color: '#DC2626',
  },
  chevron: {
    fontSize: 20,
    color: Colors.textGray,
    lineHeight: 22,
  },

  logoutContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
    backgroundColor: Colors.background,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },

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
    alignItems: 'center',
  },
  modalTrashIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  modalWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 8,
    width: '100%',
  },
  modalWarningIcon: {
    fontSize: 16,
    lineHeight: 20,
  },
  modalWarningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    lineHeight: 18,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
});

export default ProfileScreen;
