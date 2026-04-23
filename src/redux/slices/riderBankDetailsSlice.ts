import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface RiderBankDetailsState {
  data:    any | null;
  loading: boolean;
  error:   string | null;
}

const initialState: RiderBankDetailsState = {
  data:    null,
  loading: false,
  error:   null,
};

const riderBankDetailsSlice = createSlice({
  name: 'riderBankDetails',
  initialState,
  reducers: {},
  extraReducers: builder => {

    // CLEAR (loading)
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.CLEAR}_${SagaActions.FETCH}_${SagaActions.BANK_DETAILS}`,
      state => {
        state.loading = true;
        state.error   = null;
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH}_${SagaActions.BANK_DETAILS}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.loading = false;
        state.data    = action.payload ?? null;
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH}_${SagaActions.BANK_DETAILS}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload || 'Something went wrong';
      },
    );
  },
});

export default riderBankDetailsSlice.reducer;
