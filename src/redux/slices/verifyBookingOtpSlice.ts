import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface BookingData {
  _id: string;
  bookingNumber: string;
  fare: number;
  vehicleType: string;
  paymentStatus: string;
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  dropoffLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
}

interface VerifyOtpState {
  loading: boolean;
  success: boolean;
  data: { booking: BookingData } | null;
  error: string | null;
}

const initialState: VerifyOtpState = {
  loading: false,
  success: false,
  data: null,
  error: null,
};

const verifyBookingOtpSlice = createSlice({
  name: 'verifyBookingOtp',
  initialState,
  reducers: {
    resetVerifyOtpState: state => {
      state.loading = false;
      state.success = false;
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(
        (action: any) => action.type === `${SagaActions.VERIFY_BOOKING_OTP}_${SagaActionType.REQUEST}`,
        state => {
          state.loading = true;
          state.success = false;
          state.error = null;
        },
      )
      .addMatcher(
        (action: any) => action.type === `${SagaActions.VERIFY_BOOKING_OTP}_${SagaActionType.SUCCESS}`,
        (state, action: any) => {
          console.log('SLICE MATCHER HIT', JSON.stringify(action.payload));
          state.loading = false;
          state.success = true;
          state.data = action.payload?.data ?? action.payload;
        },
      )
      .addMatcher(
        (action: any) => action.type === `${SagaActions.VERIFY_BOOKING_OTP}_${SagaActionType.FAIL}`,
        (state, action: any) => {
          state.loading = false;
          state.success = false;
          state.error = action.payload;
        },
      );
  },
});

export const { resetVerifyOtpState } = verifyBookingOtpSlice.actions;
export default verifyBookingOtpSlice.reducer;