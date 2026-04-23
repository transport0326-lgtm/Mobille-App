import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface BankDetailsState {
  loading: boolean;
  success: boolean;
  error:   string | null;
}

const initialState: BankDetailsState = {
  loading: false,
  success: false,
  error:   null,
};

const bankDetailsSlice = createSlice({
  name: 'bankDetails',
  initialState,
  reducers: {
    resetBankDetails(state) {
      state.loading = false;
      state.success = false;
      state.error   = null;
    },
  },
  extraReducers: builder => {

    // CLEAR (loading)
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CLEAR}_${SagaActions.BANK_DETAILS}`,
      state => {
        state.loading = true;
        state.success = false;
        state.error   = null;
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.BANK_DETAILS}_${SagaActionType.SUCCESS}`,
      state => {
        state.loading = false;
        state.success = true;
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.BANK_DETAILS}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export const { resetBankDetails } = bankDetailsSlice.actions;
export default bankDetailsSlice.reducer;
