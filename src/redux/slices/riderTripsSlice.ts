import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

export interface RiderTrip {
  bookingNumber: string;
  pickup: string;
  dropoff: string;
  distanceKm: number;
  status: string;
  earning: number;
  fare: number;
  platformFee: number;
  completedAt: string;
}

interface RiderTripsState {
  loading: boolean;
  trips: RiderTrip[];
  error: string | null;
}

const initialState: RiderTripsState = {
  loading: false,
  trips: [],
  error: null,
};

const riderTripsSlice = createSlice({
  name: 'riderTrips',
  initialState,
  reducers: {},
  extraReducers: builder => {

    // REQUEST
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH_RIDER_TRIPS}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.trips = [];
        state.error = null;
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH_RIDER_TRIPS}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.loading = false;
        state.trips = action.payload?.trips ?? [];
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH_RIDER_TRIPS}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      },
    );
  },
});

export default riderTripsSlice.reducer;