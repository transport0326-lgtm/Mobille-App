import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface UpdateProfileState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: UpdateProfileState = {
  loading: false,
  success: false,
  error:   null,
};

const updateProfileSlice = createSlice({
  name: 'updateProfile',
  initialState,
  reducers: {
    resetUpdateProfile(state) {
      state.loading = false;
      state.success = false;
      state.error   = null;
    },
  },
  extraReducers: builder => {

    // CLEAR (loading)
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.CLEAR}_${SagaActions.UPDATE}_${SagaActions.PROFILE}`,
      state => {
        state.loading = true;
        state.success = false;
        state.error   = null;
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.UPDATE}_${SagaActions.PROFILE}_${SagaActionType.SUCCESS}`,
      state => {
        state.loading = false;
        state.success = true;
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.UPDATE}_${SagaActions.PROFILE}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export const { resetUpdateProfile } = updateProfileSlice.actions;
export default updateProfileSlice.reducer;
