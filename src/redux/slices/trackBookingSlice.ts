import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

// ─── Types ─────────────────────────────────────────

export interface FareEstimateData {
  success: boolean;
  message?: string;
  distanceKm: number;
  fare: number;
  platformFee?: number;
  total: number;
}

export interface BookingCoords {
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
}

export interface TrackBookingData {
  success: boolean;
  booking: {
    _id: string;
    bookingNumber: string;
    status: string;
    pickupLocation: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    dropoffLocation: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    vehicleType: string;
    fare: number;
    platformFee: number;
    deliveryOtp: string;
    receiverName: string;
    receiverPhone: string;
    createdAt: string;
  };
  rider: any | null;
  riderLocation: {
    lat: number;
    lng: number;
  } | null;
}

interface BookingState {
  coords: BookingCoords;

  fareEstimate: {
    loading: boolean;
    data: FareEstimateData | null;
    error: string | null;
  };

  createBooking: {
    loading: boolean;
    data: any | null;
    error: string | null;
  };

  trackBooking: {
    loading: boolean;
    data: TrackBookingData | null;
    error: string | null;
  };
}

// ─── Initial State ─────────────────────────────────

const initialState: BookingState = {
  coords: {
    pickupLat: null,
    pickupLng: null,
    dropoffLat: null,
    dropoffLng: null,
  },

  fareEstimate: {
    loading: false,
    data: null,
    error: null,
  },

  createBooking: {
    loading: false,
    data: null,
    error: null,
  },

  trackBooking: {
    loading: false,
    data: null,
    error: null,
  },
};

// ─── Slice ─────────────────────────────────────────

const bookingSlice = createSlice({
  name: 'trackBooking',
  initialState,
  reducers: {
    setBookingCoords(state, action: { payload: Partial<BookingCoords> }) {
      state.coords = { ...state.coords, ...action.payload };
    },

    resetFareEstimate(state) {
      state.fareEstimate = initialState.fareEstimate;
    },

    resetCreateBooking(state) {
      state.createBooking = initialState.createBooking;
    },

    resetTrackBooking(state) {
      state.trackBooking = initialState.trackBooking;
    },

    resetBooking(state) {
      state.coords = initialState.coords;
      state.fareEstimate = initialState.fareEstimate;
      state.createBooking = initialState.createBooking;
      state.trackBooking = initialState.trackBooking;
    },
  },

  extraReducers: builder => {

    // ── Fare Estimate ─────────────────────────

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.CLEAR}_${SagaActions.FARE_ESTIMATE}`,
      state => {
        state.fareEstimate.loading = true;
        state.fareEstimate.data = null;
        state.fareEstimate.error = null;
      },
    );

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FARE_ESTIMATE}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.fareEstimate.loading = false;
        state.fareEstimate.data = action.payload;
      },
    );

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FARE_ESTIMATE}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.fareEstimate.loading = false;
        state.fareEstimate.error = action.payload;
      },
    );

    // ── Create Booking ─────────────────────────

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.CLEAR}_${SagaActions.CREATE_BOOKING}`,
      state => {
        state.createBooking.loading = true;
        state.createBooking.data = null;
        state.createBooking.error = null;
      },
    );

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.CREATE_BOOKING}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.createBooking.loading = false;
        state.createBooking.data = action.payload;
      },
    );

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.CREATE_BOOKING}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.createBooking.loading = false;
        state.createBooking.error = action.payload;
      },
    );

    // ── Track Booking ─────────────────────────

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.TRACK_BOOKING}_${SagaActionType.REQUEST}`,
      state => {
        state.trackBooking.loading = true;
        state.trackBooking.error = null;
      },
    );

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.TRACK_BOOKING}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.trackBooking.loading = false;
        state.trackBooking.data = action.payload;
      },
    );

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.TRACK_BOOKING}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.trackBooking.loading = false;
        state.trackBooking.error = action.payload;
      },
    );
  },
});

export const {
  setBookingCoords,
  resetFareEstimate,
  resetCreateBooking,
  resetTrackBooking,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;