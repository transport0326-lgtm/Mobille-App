import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface RegisterState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: RegisterState = {
  loading: false,
  success: false,
  error:   null,
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    resetRegister(state) {
      state.loading = false;
      state.success = false;
      state.error   = null;
    },
  },
  extraReducers: builder => {

    // CLEAR (loading)
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CLEAR}_${SagaActions.REGISTER}`,
      state => {
        state.loading = true;
        state.success = false;
        state.error   = null;
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.REGISTER}_${SagaActionType.SUCCESS}`,
      state => {
        state.loading = false;
        state.success = true;
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.REGISTER}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export const { resetRegister } = registerSlice.actions;
export default registerSlice.reducer;
