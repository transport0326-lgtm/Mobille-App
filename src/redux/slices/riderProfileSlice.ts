import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface RiderProfileState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: RiderProfileState = {
  data:    null,
  loading: false,
  error:   null,
};

export const riderProfileSlice = createSlice({
  name: 'riderProfile',
  initialState,
  reducers: {},
  extraReducers: builder => {

    // CLEAR (loading)
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.CLEAR}_${SagaActions.RIDER_PROFILE}`,
      state => {
        state.loading = true;
        state.error   = null;
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH}_${SagaActions.RIDER_PROFILE}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.data    = action.payload ?? null;
        state.loading = false;
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH}_${SagaActions.RIDER_PROFILE}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload || 'Something went wrong';
      },
    );
  },
});

export default riderProfileSlice.reducer;
