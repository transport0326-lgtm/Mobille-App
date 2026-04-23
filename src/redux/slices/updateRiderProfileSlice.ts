import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface UpdateRiderProfileState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: UpdateRiderProfileState = {
  loading: false,
  success: false,
  error:   null,
};

const updateRiderProfileSlice = createSlice({
  name: 'updateRiderProfile',
  initialState,
  reducers: {
    resetUpdateRiderProfile(state) {
      state.loading = false;
      state.success = false;
      state.error   = null;
    },
  },
  extraReducers: builder => {

    // CLEAR (loading)
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.CLEAR}_${SagaActions.UPDATE}_${SagaActions.RIDER_PROFILE}`,
      state => {
        state.loading = true;
        state.success = false;
        state.error   = null;
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.UPDATE}_${SagaActions.RIDER_PROFILE}_${SagaActionType.SUCCESS}`,
      state => {
        state.loading = false;
        state.success = true;
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.UPDATE}_${SagaActions.RIDER_PROFILE}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export const { resetUpdateRiderProfile } = updateRiderProfileSlice.actions;
export default updateRiderProfileSlice.reducer;
