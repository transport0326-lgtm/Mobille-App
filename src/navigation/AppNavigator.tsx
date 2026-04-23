import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Shared
import SplashScreen from '../screens/shared/SplashScreen';
import HelpSupportScreen from '../screens/shared/HelpSupportScreen';
import LiveChatScreen from '../screens/shared/LiveChatScreen';
import LanguageScreen from '../screens/shared/LanguageScreen';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';

// Customer
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import SetLocationScreen from '../screens/customer/SetLocationScreen';
import MapPickerScreen from '../screens/customer/MapPickerScreen';
import FindingRiderScreen from '../screens/customer/FindingRiderScreen';
import BookingConfirmedScreen from '../screens/customer/BookingConfirmedScreen';
import CancelBookingScreen from '../screens/customer/CancelBookingScreen';
import NoRidersScreen from '../screens/customer/NoRidersScreen';
import RateDeliveryScreen from '../screens/customer/RateDeliveryScreen';
import TripCompletedScreen from '../screens/customer/TripCompletedScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import BankPaymentScreen from '../screens/customer/BankPaymentScreen';

// Rider
import RiderDashboard from '../screens/rider/RiderDashboard';
import GoingToPickupScreen from '../screens/rider/GoingToPickupScreen';
import DeliveringParcelScreen from '../screens/rider/DeliveringParcelScreen';
import VerifyDeliveryOTPScreen from '../screens/rider/VerifyDeliveryOTPScreen';
import RiderTripsScreen from '../screens/rider/RiderTripsScreen';
import RiderEarningsScreen from '../screens/rider/RiderEarningsScreen';
import RiderProfileScreen from '../screens/rider/RiderProfileScreen';
import VehicleDetailsScreen from '../screens/rider/VehicleDetailsScreen';
import EditVehicleDetailsScreen from '../screens/rider/EditVehicleDetailsScreen';
import DocumentsKYCScreen from '../screens/rider/DocumentsKYCScreen';
import EditBankDetailsScreen from '../screens/rider/EditBankDetailsScreen';
import RiderBankPaymentScreen from '../screens/rider/RiderBankPaymentScreen';
import RiderEditProfileScreen from '../screens/rider/RiderEditProfileScreen';
import DeliveryCompleteScreen from '../screens/rider/DeliveryCompleteScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OTP: { phoneNumber: string };
  CreateAccount: { phoneNumber: string };
  FindingRider: { pickup: string; dropoff: string };
  NoRiders: { pickup: string; dropoff: string };
  SetLocation: {
    type: 'pickup' | 'dropoff';
    currentPickup?: string;
    currentDropoff?: string;
    vehicleType?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
  };
  CustomerDashboard: {
    confirmedPickup?: string;
    confirmedDropoff?: string;
    tab?: 'Home' | 'Orders' | 'Alerts' | 'Profile';
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
  } | undefined;
  CancelBooking: undefined;
  BookingConfirmed: undefined;
  DeliveryComplete: undefined;
  RateDelivery: undefined;
  EditProfile: undefined;
  HelpSupport: undefined;
  LiveChat: undefined;
  Language: undefined;
  RiderDashboard: undefined;
  GoingToPickup: undefined;
  DeliveringParcel: undefined;
  VerifyDeliveryOTP: undefined;
  TripCompleted: undefined;
  RiderTrips: undefined;
  RiderEarnings: undefined;
  BankPayment: undefined;
  RiderProfile: undefined;
  VehicleDetails: undefined;
  EditVehicleDetails: undefined;
  DocumentsKYC: undefined;
  EditBankDetails: undefined;
  RiderBankPayment: undefined;
  RiderEditProfile: undefined;
  MapPicker: {
    type: 'pickup' | 'dropoff';
    currentPickup?: string;
    currentDropoff?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
        <Stack.Screen name="FindingRider" component={FindingRiderScreen} />
        <Stack.Screen name="SetLocation" component={SetLocationScreen} />
        <Stack.Screen name="CancelBooking" component={CancelBookingScreen} />
        <Stack.Screen name="NoRiders" component={NoRidersScreen} />
        <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
        <Stack.Screen name="DeliveryComplete" component={DeliveryCompleteScreen} />
        <Stack.Screen name="RateDelivery" component={RateDeliveryScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="LiveChat" component={LiveChatScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="RiderDashboard" component={RiderDashboard} />
        <Stack.Screen name="GoingToPickup" component={GoingToPickupScreen} />
        <Stack.Screen name="DeliveringParcel" component={DeliveringParcelScreen} />
        <Stack.Screen name="VerifyDeliveryOTP" component={VerifyDeliveryOTPScreen} />
        <Stack.Screen name="TripCompleted" component={TripCompletedScreen} />
        <Stack.Screen name="RiderTrips" component={RiderTripsScreen} />
        <Stack.Screen name="RiderEarnings" component={RiderEarningsScreen} />
        <Stack.Screen name="BankPayment" component={BankPaymentScreen} />
        <Stack.Screen name="RiderProfile" component={RiderProfileScreen} />
        <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
        <Stack.Screen name="EditVehicleDetails" component={EditVehicleDetailsScreen} />
        <Stack.Screen name="DocumentsKYC" component={DocumentsKYCScreen} />
        <Stack.Screen name="EditBankDetails" component={EditBankDetailsScreen} />
        <Stack.Screen name="RiderBankPayment" component={RiderBankPaymentScreen} />
        <Stack.Screen name="RiderEditProfile" component={RiderEditProfileScreen} />
        <Stack.Screen name="MapPicker" component={MapPickerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
