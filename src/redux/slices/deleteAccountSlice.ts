import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface DeleteAccountState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: DeleteAccountState = {
  loading: false,
  success: false,
  error: null,
};

const deleteAccountSlice = createSlice({
  name: 'deleteAccount',
  initialState,
  reducers: {
    resetDeleteAccount(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(
        (action: any) =>
          action.type === `${SagaActions.DELETE_ACCOUNT}_${SagaActionType.REQUEST}`,
        state => {
          state.loading = true;
          state.success = false;
          state.error = null;
        },
      )
      .addMatcher(
        (action: any) =>
          action.type === `${SagaActions.DELETE_ACCOUNT}_${SagaActionType.SUCCESS}`,
        state => {
          state.loading = false;
          state.success = true;
        },
      )
      .addMatcher(
        (action: any) =>
          action.type === `${SagaActions.DELETE_ACCOUNT}_${SagaActionType.FAIL}`,
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { resetDeleteAccount } = deleteAccountSlice.actions;
export default deleteAccountSlice.reducer;
