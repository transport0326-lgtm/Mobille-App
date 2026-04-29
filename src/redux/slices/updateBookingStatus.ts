import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface BookingState {
  loading: boolean;
  success: boolean;
  error: string | null;
  booking: any | null;
  etaMinutes: number | null;
}

const initialState: BookingState = {
  loading: false,
  success: false,
  error: null,
  booking: null,
  etaMinutes: null,
};

const updateBookingStatusSlice = createSlice({
  name: 'updateBookingStatus',
  initialState,
  reducers: {
    resetUpdateBookingStatus(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.booking = null;
      state.etaMinutes = null;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.UPDATE_BOOKING_STATUS}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.success = false;
        state.error = null;
      },
    );

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.UPDATE_BOOKING_STATUS}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.loading = false;
        state.success = true;
        state.booking = action.payload?.booking;
        state.etaMinutes = action.payload?.etaMinutes ?? null;
      },
    );

    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.UPDATE_BOOKING_STATUS}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      },
    );
  },
});

export const { resetUpdateBookingStatus } = updateBookingStatusSlice.actions;
export default updateBookingStatusSlice.reducer;