import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface CancelBookingState {
  loading: boolean;
  success: boolean;
  data:    any | null;
  error:   string | null;
}

const initialState: CancelBookingState = {
  loading: false,
  success: false,
  data:    null,
  error:   null,
};

const cancelBookingSlice = createSlice({
  name: 'cancelBooking',
  initialState,
  reducers: {
    resetCancelBooking: () => initialState,
  },
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CANCEL_BOOKING}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.success = false;
        state.data    = null;
        state.error   = null;
      },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CANCEL_BOOKING}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.loading = false;
        state.success = true;
        state.data    = action.payload;
      },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CANCEL_BOOKING}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export const { resetCancelBooking } = cancelBookingSlice.actions;
export default cancelBookingSlice.reducer;
