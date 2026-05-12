import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  coordinates: Coordinates;
  address: string;
}

interface Booking {
  _id: string;
  userId: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  vehicleType: string;
  parcelDetails: string;
  receiverName: string;
  receiverPhone: string;
  fare: number;
  platformFee: number;
  status: string;
  riderId: string | null;
  pendingRiderId: string | null;
  rejectedRiderIds: string[];
  rejectReason: string | null;
  cancelReason: string | null;
  deliveryOtp: string;
  createdAt: string;
  updatedAt: string;
  bookingNumber: string;
  distanceKm?: number;
}

interface Customer {
  name: string;
  phone: string;
}

interface CancelledBooking {
  _id: string;
  bookingNumber: string;
  pickupAddress: string;
  dropoffAddress: string;
  fare: number;
  cancelReason: string;
  cancelledAt: string;
  customer: { name: string; phone: string };
  receiver: { name: string; phone: string };
}

interface RiderActiveData {
  booking: Booking | null;
  distanceKm: number | null;
  etaMinutes: number | null;
  customer: Customer | null;
  cancelled: CancelledBooking | null;
}

export type { CancelledBooking };

interface RiderActiveState {
  loading: boolean;
  success: boolean;
  error: string | null;
  data: RiderActiveData | null;
  skipRestore: boolean;
}

const initialState: RiderActiveState = {
  loading: false,
  success: false,
  error: null,
  data: null,
  skipRestore: false,
};

const riderActiveSlice = createSlice({
  name: 'riderActive',
  initialState,
  reducers: {
    resetRiderActive(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
      state.skipRestore = false;
    },
    setSkipRestore(state) {
      state.skipRestore = true;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.RIDER_ACTIVE}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.success = false;
        state.error = null;
      },
    );
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.RIDER_ACTIVE}_${SagaActionType.SUCCESS}`, // ✅ FETCH_ prefix nahi
      (state, action: any) => {
        state.loading = false;
        state.success = true;
        state.data = {
          booking: action.payload?.booking ?? null,
          distanceKm: action.payload?.distanceKm ?? null,
          etaMinutes: action.payload?.etaMinutes ?? null,
          customer: action.payload?.customer ?? null,
          cancelled: action.payload?.cancelled ?? null,
        };
      },
    );
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.RIDER_ACTIVE}_${SagaActionType.FAIL}`, // ✅ FETCH_ prefix nahi
      (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.data = null;
      },
    );
  },
});

export const { resetRiderActive , setSkipRestore  } = riderActiveSlice.actions;
export default riderActiveSlice.reducer;