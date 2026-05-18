import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { register } from '../../redux/sagas/register/registerAction';
import { resetRegister } from '../../redux/slices/registerSlice';
import type { AppDispatch, RootState } from '../../redux/store';

type PolicyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Policy'>;
  route: RouteProp<RootStackParamList, 'Policy'>;
};

type Role = 'customer' | 'rider' | null;

const CUSTOMER_COLOR = '#3C82F6';
const RIDER_COLOR = Colors.primary; // #F75522

// ─── Policy Section Components ───────────────────────────────────────────────

const SectionHeader = ({
  emoji,
  title,
  accentColor,
}: {
  emoji: string;
  title: string;
  accentColor: string;
}) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionBar, { backgroundColor: accentColor }]} />
    <Text style={[styles.sectionEmoji, { color: accentColor }]}>{emoji}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const BulletItem = ({
  label,
  sub,
  accentColor,
}: {
  label: string;
  sub?: string;
  accentColor: string;
}) => (
  <View style={styles.bulletRow}>
    <View style={[styles.bullet, { backgroundColor: accentColor }]} />
    <View style={styles.bulletText}>
      <Text style={styles.bulletLabel}>{label}</Text>
      {sub ? <Text style={styles.bulletSub}>{sub}</Text> : null}
    </View>
  </View>
);

const Divider = () => <View style={styles.divider} />;

// ─── Policy Content ───────────────────────────────────────────────────────────

const CustomerPolicyContent = () => {
  const accent = CUSTOMER_COLOR;
  return (
    <>
      <View style={[styles.dateBadge, { backgroundColor: `${accent}18` }]}>
        <Text style={[styles.dateBadgeText, { color: accent }]}>
          📅 Effective Date: [Effective Date] · Version 1.0
        </Text>
      </View>

      <SectionHeader emoji="📋" title="1.  Introduction" accentColor={accent} />
      <Text style={styles.bodyText}>
        Transpport is committed to protecting your personal information. This
        Privacy Policy explains what data we collect, why we collect it, how we
        use and share it, and your rights.
      </Text>

      <Divider />
      <SectionHeader
        emoji="🗂"
        title="2.  Data We Collect"
        accentColor={accent}
      />
      <Text style={[styles.subLabel, { color: accent }]}>From Customers</Text>
      <BulletItem
        label="Full name & mobile number"
        sub="Mandatory for OTP registration"
        accentColor={accent}
      />
      <BulletItem
        label="Email address"
        sub="If provided"
        accentColor={accent}
      />
      <BulletItem
        label="Pickup & drop-off locations"
        sub="Current and past addresses"
        accentColor={accent}
      />
      <BulletItem
        label="Live GPS location data"
        sub="While App is in use or background (with permission)"
        accentColor={accent}
      />
      <BulletItem
        label="Booking history & transaction records"
        accentColor={accent}
      />
      <BulletItem
        label="Device info"
        sub="Model, OS, App version, IP address, analytics"
        accentColor={accent}
      />
      <BulletItem
        label="Payment reference data"
        sub="Full card/bank details are NOT stored"
        accentColor={accent}
      />
      <Text style={styles.subLabel}>Automatically Collected</Text>
      <BulletItem
        label="App usage logs, error logs, crash reports"
        accentColor={accent}
      />
      <BulletItem
        label="Cookies / session management technologies"
        accentColor={accent}
      />
      <BulletItem
        label="Aggregated, anonymised analytics data"
        accentColor={accent}
      />

      <Divider />
      <SectionHeader
        emoji="🎯"
        title="3.  Why We Collect This Data"
        accentColor={accent}
      />
      <BulletItem label="Create and verify your account" accentColor={accent} />
      <BulletItem
        label="Facilitate bookings & match with riders"
        accentColor={accent}
      />
      <BulletItem
        label="Process payments and manage payouts"
        accentColor={accent}
      />
      <BulletItem
        label="Provide real-time booking tracking"
        accentColor={accent}
      />
      <BulletItem
        label="Improve App performance and features"
        accentColor={accent}
      />
      <BulletItem
        label="Send booking confirmations & updates"
        accentColor={accent}
      />
      <BulletItem
        label="Comply with applicable Indian laws"
        accentColor={accent}
      />
      <BulletItem
        label="Detect fraud, abuse & security incidents"
        accentColor={accent}
      />

      <Divider />
      <SectionHeader
        emoji="🔗"
        title="4.  Sharing of Data"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        We do not sell your personal data. We may share your data with:
      </Text>
      <BulletItem
        label="Riders"
        sub="Customer pickup location & first name shared to facilitate booking"
        accentColor={accent}
      />
      <BulletItem
        label="Customers"
        sub="Rider name, vehicle details & live location for tracking"
        accentColor={accent}
      />
      <BulletItem
        label="Payment gateway partners"
        sub="Transaction data to process payments"
        accentColor={accent}
      />
      <BulletItem
        label="Cloud & technology providers"
        sub="App hosting, storage, analytics"
        accentColor={accent}
      />
      <BulletItem
        label="KYC/verification providers"
        sub="Rider onboarding verification"
        accentColor={accent}
      />
      <BulletItem
        label="Law enforcement"
        sub="Where required by law or court order"
        accentColor={accent}
      />

      <Divider />
      <SectionHeader
        emoji="📍"
        title="5.  GPS & Location Data"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        The App requires GPS access for matching riders, real-time tracking, and
        pricing estimates. You may adjust location permissions in device
        settings — disabling may limit App features.
      </Text>

      <Divider />
      <SectionHeader
        emoji="🗄"
        title="6.  Data Retention"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        We retain your personal data as long as your account is active and as
        required by Indian law. Booking records and financial data are retained
        for approximately 7 years per financial record-keeping requirements. You
        may request account and data deletion, subject to legal obligations.
      </Text>

      <Divider />
      <SectionHeader
        emoji="🔒"
        title="7.  Data Security"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        We implement reasonable technical and organisational security measures
        including encrypted data transmission, access controls, and secure
        storage. No digital system is completely secure — we cannot guarantee
        absolute security.
      </Text>

      <Divider />
      <SectionHeader emoji="⚖" title="8.  Your Rights" accentColor={accent} />
      <BulletItem
        label="Access the personal data we hold about you"
        accentColor={accent}
      />
      <BulletItem
        label="Request correction of inaccurate data"
        accentColor={accent}
      />
      <BulletItem
        label="Request deletion of your data"
        sub="Subject to legal retention requirements"
        accentColor={accent}
      />
      <BulletItem
        label="Withdraw consent for data processing"
        accentColor={accent}
      />
      <BulletItem
        label="Raise a complaint with the data protection authority"
        accentColor={accent}
      />

      <Divider />
      <SectionHeader
        emoji="👶"
        title="9.  Children's Privacy"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        The App is not intended for users under 18 years of age. We do not
        knowingly collect data from minors. If we become aware a minor has
        registered, the account will be deactivated.
      </Text>

      <Divider />
      <SectionHeader
        emoji="✉"
        title="10. Contact & Updates"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        For privacy concerns, contact us at [Support Email] | [Support Phone]
      </Text>
      <Text style={[styles.bodyText, { marginTop: 6 }]}>
        We may update this Policy from time to time. Continued use of the App
        after notification constitutes acceptance of the updated Policy.
      </Text>

      <View style={styles.policyFooter}>
        <Text style={styles.policyFooterText}>
          Transpport Privacy Policy · Phase 1 MVP · Kolkata, India{'\n'}
          For legal queries contact [Support Email]
        </Text>
      </View>
    </>
  );
};

const RiderPolicyContent = () => {
  const accent = RIDER_COLOR;
  return (
    <>
      <View style={[styles.dateBadge, { backgroundColor: `${accent}18` }]}>
        <Text style={[styles.dateBadgeText, { color: accent }]}>
          📅 Effective Date: [Effective Date] · Version 1.0
        </Text>
      </View>

      <SectionHeader emoji="📋" title="1.  Introduction" accentColor={accent} />
      <Text style={styles.bodyText}>
        Transpport is committed to protecting your personal information. This
        Privacy Policy explains what data we collect as a Rider/Driver-Partner,
        why we collect it, and your rights.
      </Text>

      <Divider />
      <SectionHeader
        emoji="🗂"
        title="2.  Data We Collect"
        accentColor={accent}
      />
      <Text style={[styles.subLabel, { color: accent }]}>
        From Rider / Driver-Partners
      </Text>
      <BulletItem
        label="Full name, mobile number, email, date of birth"
        accentColor={accent}
      />
      <BulletItem
        label="Government ID documents"
        sub="Aadhaar, PAN, Driving Licence"
        accentColor={accent}
      />
      <BulletItem
        label="Vehicle RC, permit & insurance documents"
        accentColor={accent}
      />
      <BulletItem
        label="Bank account / UPI details"
        sub="For payout processing"
        accentColor={accent}
      />
      <BulletItem
        label="Live GPS location data"
        sub="While on duty on the platform"
        accentColor={accent}
      />
      <BulletItem label="Profile photograph" accentColor={accent} />
      <BulletItem
        label="KYC verification & onboarding records"
        accentColor={accent}
      />
      <Text style={styles.subLabel}>Automatically Collected</Text>
      <BulletItem
        label="App usage logs, error logs, crash reports"
        accentColor={accent}
      />
      <BulletItem
        label="Cookies / session management technologies"
        accentColor={accent}
      />
      <BulletItem
        label="Aggregated, anonymised analytics data"
        accentColor={accent}
      />

      <Divider />
      <SectionHeader
        emoji="🎯"
        title="3.  Why We Collect This Data"
        accentColor={accent}
      />
      <BulletItem
        label="Create and verify your rider account"
        accentColor={accent}
      />
      <BulletItem
        label="Facilitate bookings & match you with customers"
        accentColor={accent}
      />
      <BulletItem
        label="Process payments and manage payouts to you"
        accentColor={accent}
      />
      <BulletItem
        label="Provide real-time booking tracking"
        accentColor={accent}
      />
      <BulletItem
        label="Improve App performance and features"
        accentColor={accent}
      />
      <BulletItem
        label="Send booking confirmations & updates"
        accentColor={accent}
      />
      <BulletItem
        label="Comply with applicable Indian laws"
        accentColor={accent}
      />
      <BulletItem
        label="Detect fraud, abuse & security incidents"
        accentColor={accent}
      />
      <BulletItem
        label="Verify rider identity & document authenticity during onboarding"
        accentColor={accent}
      />

      <Divider />
      <SectionHeader
        emoji="🔗"
        title="4.  Sharing of Data"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        We do not sell your personal data. We may share your data with:
      </Text>
      <BulletItem
        label="Customers"
        sub="Your name, vehicle details & live location shared for tracking"
        accentColor={accent}
      />
      <BulletItem
        label="Payment gateway partners"
        sub="Transaction data to process payouts"
        accentColor={accent}
      />
      <BulletItem
        label="Cloud & technology providers"
        sub="App hosting, storage, analytics"
        accentColor={accent}
      />
      <BulletItem
        label="KYC/verification providers"
        sub="For onboarding verification"
        accentColor={accent}
      />
      <BulletItem
        label="Law enforcement"
        sub="Where required by law or court order"
        accentColor={accent}
      />

      <Divider />
      <SectionHeader
        emoji="📍"
        title="5.  GPS & Location Data"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        Location data is collected while you are active on the platform. This
        data is used for trip matching, real-time tracking, pricing estimates,
        trip verification, dispute resolution, and operational analytics.
      </Text>

      <Divider />
      <SectionHeader
        emoji="🗄"
        title="6.  Data Retention"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        We retain your data as long as your account is active and as required by
        Indian law. KYC documents and financial records are retained for
        approximately 7 years. You may request account and data deletion,
        subject to legal obligations.
      </Text>

      <Divider />
      <SectionHeader
        emoji="🔒"
        title="7.  Data Security"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        We implement encrypted data transmission, access controls, and secure
        storage. No digital system is completely secure — we cannot guarantee
        absolute security.
      </Text>

      <Divider />
      <SectionHeader emoji="⚖" title="8.  Your Rights" accentColor={accent} />
      <BulletItem
        label="Access the personal data we hold about you"
        accentColor={accent}
      />
      <BulletItem
        label="Request correction of inaccurate data"
        accentColor={accent}
      />
      <BulletItem
        label="Request deletion of your data"
        sub="Subject to legal retention requirements"
        accentColor={accent}
      />
      <BulletItem
        label="Withdraw consent for data processing"
        accentColor={accent}
      />
      <BulletItem
        label="Raise a complaint with the data protection authority"
        accentColor={accent}
      />

      <Divider />
      <SectionHeader
        emoji="👶"
        title="9.  Children's Policy"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        The App is not intended for users under 18 years of age. Riders must be
        adults capable of entering a legally binding contract.
      </Text>

      <Divider />
      <SectionHeader
        emoji="✉"
        title="10. Contact & Updates"
        accentColor={accent}
      />
      <Text style={styles.bodyText}>
        For privacy concerns, contact us at [Support Email] | [Support Phone]
      </Text>
      <Text style={[styles.bodyText, { marginTop: 6 }]}>
        We may update this Policy from time to time. Continued use of the App
        constitutes acceptance.
      </Text>

      <View style={styles.policyFooter}>
        <Text style={styles.policyFooterText}>
          Transpport Privacy Policy · Phase 1 MVP · Kolkata, India{'\n'}
          For legal queries contact [Support Email]
        </Text>
      </View>
    </>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const PolicyScreen: React.FC<PolicyScreenProps> = ({ navigation, route }) => {
  const { phoneNumber, role: roleParam, formData } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector(
    (state: RootState) => state.register,
  );

  const initialRole: Role =
    roleParam === 'customer' ? 'customer' : roleParam === 'partner' ? 'rider' : null;

  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [accepted, setAccepted] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  const accentColor =
    selectedRole === 'customer' ? CUSTOMER_COLOR : RIDER_COLOR;

  const confirmEnabled = accepted && !loading;

  useEffect(() => {
    if (success) {
      dispatch(resetRegister());
      navigation.reset({
        index: 0,
        routes: [{ name: roleParam === 'customer' ? 'CustomerDashboard' : 'RiderDashboard' }],
      });
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
      dispatch(resetRegister());
    }
  }, [error]);

  const handleRoleSelect = (r: Role) => {
    setSelectedRole(r);
    setReachedEnd(false);
    setAccepted(false);
  };

  const handleScroll = (e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 30) {
      setReachedEnd(true);
    }
  };

  const handleConfirm = () => {
    if (formData) {
      dispatch(
        register({
          phone: phoneNumber,
          name: formData.fullName,
          email: formData.email,
          userType: roleParam === 'customer' ? 'user' : 'rider',
          ...(roleParam === 'partner' && {
            vehicleType: formData.vehicleType,
            vehicleNumber: formData.vehicleNumber,
            dlNumber: formData.dlNumber,
            rcNumber: formData.rcNumber,
            deliveryState: formData.deliveryAddress,
          }),
        }),
      );
    } else {
      navigation.navigate('CreateAccount', { phoneNumber });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      {/* Role Selector */}
      <View style={styles.tabContainer}>
        {/* <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.tab,
            selectedRole === 'customer'
              ? { backgroundColor: CUSTOMER_COLOR }
              : styles.tabInactive,
          ]}
          onPress={() => handleRoleSelect('customer')}
        >
          <Text style={styles.tabEmoji}>👤</Text>
          <Text
            style={[
              styles.tabLabel,
              selectedRole === 'customer'
                ? styles.tabLabelActive
                : styles.tabLabelInactive,
            ]}
          >
            Customer Policy
          </Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.tab,
            selectedRole === 'rider'
              ? { backgroundColor: RIDER_COLOR }
              : styles.tabInactive,
          ]}
          onPress={() => handleRoleSelect('rider')}
        >
          <Text style={styles.tabEmoji}>🚚</Text>
          <Text
            style={[
              styles.tabLabel,
              selectedRole === 'rider'
                ? styles.tabLabelActive
                : styles.tabLabelInactive,
            ]}
          >
            Partner Policy
          </Text>
        </TouchableOpacity> */}
      </View>

      {/* Policy Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {selectedRole === null && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Please select a role above to view the relevant Privacy Policy.
            </Text>
          </View>
        )}
        {selectedRole === 'customer' && <CustomerPolicyContent />}
        {selectedRole === 'rider' && <RiderPolicyContent />}
      </ScrollView>

      {/* Footer: Checkbox + Confirm */}
      <View style={styles.footer}>
        {reachedEnd && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.checkboxRow}
            onPress={() => setAccepted(prev => !prev)}
          >
            <View
              style={[
                styles.checkbox,
                accepted && {
                  backgroundColor: accentColor,
                  borderColor: accentColor,
                },
              ]}
            >
              {accepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and agree to the above Privacy Policy
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={confirmEnabled ? 0.85 : 1}
          style={[
            styles.confirmBtn,
            !confirmEnabled && styles.confirmBtnDisabled,
            confirmEnabled && { backgroundColor: accentColor },
          ]}
          onPress={confirmEnabled ? handleConfirm : undefined}
          disabled={!confirmEnabled}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.confirmBtnText}>Confirm</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    fontSize: 17,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Role Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  tabInactive: {
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: Colors.white,
  },
  tabLabelInactive: {
    color: '#737373',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },

  // Date Badge
  dateBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionBar: {
    width: 3,
    height: 22,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    flex: 1,
  },

  // Body / Sub text
  bodyText: {
    fontSize: 12,
    color: '#737373',
    lineHeight: 18,
    marginBottom: 10,
    marginLeft: 4,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#737373',
    marginBottom: 6,
    marginLeft: 4,
    marginTop: 2,
  },

  // Bullet
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    marginRight: 10,
    flexShrink: 0,
  },
  bulletText: { flex: 1 },
  bulletLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1C',
    lineHeight: 17,
  },
  bulletSub: {
    fontSize: 11,
    color: '#A6A6A6',
    lineHeight: 16,
    marginTop: 1,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E1E1E1',
    marginVertical: 10,
  },

  // Policy Footer
  policyFooter: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    marginBottom: 4,
    alignItems: 'center',
  },
  policyFooterText: {
    fontSize: 11,
    color: '#A6A6A6',
    textAlign: 'center',
    lineHeight: 17,
  },

  // Empty state
  emptyState: {
    paddingTop: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#A6A6A6',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
    gap: 12,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkmark: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '800',
    lineHeight: 16,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#444444',
    flex: 1,
    lineHeight: 18,
  },

  // Confirm Button
  confirmBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  confirmBtnDisabled: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default PolicyScreen;
