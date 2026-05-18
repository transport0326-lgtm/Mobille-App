import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface SubState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

interface ChangePhoneState {
  sendOtp: SubState;
  verifyOtp: SubState;
}

const sub = (): SubState => ({ loading: false, success: false, error: null });

const initialState: ChangePhoneState = {
  sendOtp: sub(),
  verifyOtp: sub(),
};

const changePhoneSlice = createSlice({
  name: 'changePhone',
  initialState,
  reducers: {
    resetChangePhone(state) {
      state.sendOtp = sub();
      state.verifyOtp = sub();
    },
    resetSendOtp(state) {
      state.sendOtp = sub();
    },
    resetVerifyOtp(state) {
      state.verifyOtp = sub();
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_SEND_OTP}`,
      state => { state.sendOtp = { loading: true, success: false, error: null }; },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_SEND_OTP}_${SagaActionType.SUCCESS}`,
      state => { state.sendOtp = { loading: false, success: true, error: null }; },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_SEND_OTP}_${SagaActionType.FAIL}`,
      (state, action: any) => { state.sendOtp = { loading: false, success: false, error: action.payload }; },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_VERIFY_OTP}`,
      state => { state.verifyOtp = { loading: true, success: false, error: null }; },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_VERIFY_OTP}_${SagaActionType.SUCCESS}`,
      state => { state.verifyOtp = { loading: false, success: true, error: null }; },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_VERIFY_OTP}_${SagaActionType.FAIL}`,
      (state, action: any) => { state.verifyOtp = { loading: false, success: false, error: action.payload }; },
    );
  },
});

export const { resetChangePhone, resetSendOtp, resetVerifyOtp } = changePhoneSlice.actions;
export default changePhoneSlice.reducer;
