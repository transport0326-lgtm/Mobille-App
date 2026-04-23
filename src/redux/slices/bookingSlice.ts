import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FareEstimateData {
  success:      boolean;
  message?:     string;
  distanceKm:   number;
  fare:         number;
  platformFee?: number;
  total:        number;
}

export interface BookingCoords {
  pickupLat:  number | null;
  pickupLng:  number | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
}

interface BookingState {
  coords: BookingCoords;
  fareEstimate: {
    loading: boolean;
    data:    FareEstimateData | null;
    error:   string | null;
  };
  createBooking: {
    loading: boolean;
    data:    any | null;
    error:   string | null;
  };
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: BookingState = {
  coords: {
    pickupLat:  null,
    pickupLng:  null,
    dropoffLat: null,
    dropoffLng: null,
  },
  fareEstimate: {
    loading: false,
    data:    null,
    error:   null,
  },
  createBooking: {
    loading: false,
    data:    null,
    error:   null,
  },
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingCoords(state, action: { payload: Partial<BookingCoords> }) {
      state.coords = { ...state.coords, ...action.payload };
    },
    resetFareEstimate(state) {
      state.fareEstimate = initialState.fareEstimate;
    },
    resetBooking(state) {
      state.coords         = initialState.coords;
      state.fareEstimate   = initialState.fareEstimate;
      state.createBooking  = initialState.createBooking;
    },
    resetCreateBooking(state) {
      state.createBooking = initialState.createBooking;
    },
  },
  extraReducers: builder => {

    // ── Fare Estimate ─────────────────────────────────────────────────────────

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CLEAR}_${SagaActions.FARE_ESTIMATE}`,
      state => {
        state.fareEstimate.loading = true;
        state.fareEstimate.data    = null;
        state.fareEstimate.error   = null;
      },
    );

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.FARE_ESTIMATE}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.fareEstimate.loading = false;
        state.fareEstimate.data    = action.payload;
      },
    );

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.FARE_ESTIMATE}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.fareEstimate.loading = false;
        state.fareEstimate.error   = action.payload;
      },
    );

    // ── Create Booking ────────────────────────────────────────────────────────

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CLEAR}_${SagaActions.CREATE_BOOKING}`,
      state => {
        state.createBooking.loading = true;
        state.createBooking.data    = null;
        state.createBooking.error   = null;
      },
    );

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CREATE_BOOKING}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.createBooking.loading = false;
        state.createBooking.data    = action.payload;
      },
    );

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CREATE_BOOKING}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.createBooking.loading = false;
        state.createBooking.error   = action.payload;
      },
    );
  },
});

export const { setBookingCoords, resetFareEstimate, resetBooking, resetCreateBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
