import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface AcceptBookingState {
  loading: boolean;
  success: boolean;
  data:    any | null;
  error:   string | null;
}

const initialState: AcceptBookingState = {
  loading: false,
  success: false,
  data:    null,
  error:   null,
};

const acceptBookingSlice = createSlice({
  name: 'acceptBooking',
  initialState,
  reducers: {
    resetAcceptBooking: () => initialState,
  },
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.ACCEPT_BOOKING}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.success = false;
        state.data    = null;
        state.error   = null;
      },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.ACCEPT_BOOKING}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.loading = false;
        state.success = true;
        state.data    = action.payload;
      },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.ACCEPT_BOOKING}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export const { resetAcceptBooking } = acceptBookingSlice.actions;
export default acceptBookingSlice.reducer;
