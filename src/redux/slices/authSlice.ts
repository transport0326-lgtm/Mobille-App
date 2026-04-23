import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface SendOtpState {
  loading: boolean;
  success: boolean;
  error: string | null;
  phoneNumber: string | null;
  otp: string | null;
}

interface VerifyOtpState {
  loading: boolean;
  success: boolean;
  error: string | null;
  isNewUser: boolean | null;
  isUser: boolean | null;
  isRider: boolean | null;
  token: string | null;
}

interface AuthState {
  sendOtp: SendOtpState;
  verifyOtp: VerifyOtpState;
}

const initialState: AuthState = {
  sendOtp: {
    loading: false,
    success: false,
    error: null,
    phoneNumber: null,
    otp: null,
  },
  verifyOtp: {
    loading: false,
    success: false,
    error: null,
    isNewUser: null,
    isUser: null,
    isRider: null,
    token: null,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetSendOtp(state) {
      state.sendOtp = initialState.sendOtp;
    },
    resetVerifyOtp(state) {
      state.verifyOtp = initialState.verifyOtp;
    },
  },
  extraReducers: builder => {

    // ── Send OTP — CLEAR (loading) ─────────────────────────────────────────────
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CLEAR}_${SagaActions.SEND_OTP}`,
      state => {
        state.sendOtp = { ...initialState.sendOtp, loading: true };
      },
    );

    // ── Send OTP — SUCCESS ─────────────────────────────────────────────────────
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.SEND_OTP}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.sendOtp.loading     = false;
        state.sendOtp.success     = true;
        state.sendOtp.phoneNumber = action.payload.phoneNumber;
        state.sendOtp.otp         = action.payload.otp;
      },
    );

    // ── Send OTP — FAIL ────────────────────────────────────────────────────────
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.SEND_OTP}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.sendOtp.loading = false;
        state.sendOtp.error   = action.payload;
      },
    );

    // ── Verify OTP — REQUEST ───────────────────────────────────────────────────
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.SEND}_${SagaActions.VERIFY_OTP}_${SagaActionType.REQUEST}`,
      state => {
        state.verifyOtp.loading = true;
        state.verifyOtp.success = false;
        state.verifyOtp.error   = null;
      },
    );

    // ── Verify OTP — SUCCESS ───────────────────────────────────────────────────
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.VERIFY_OTP}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.verifyOtp.loading   = false;
        state.verifyOtp.success   = true;
        state.verifyOtp.isNewUser = action.payload.isNewUser ?? null;
        state.verifyOtp.isUser    = action.payload.isUser   ?? null;
        state.verifyOtp.isRider   = action.payload.isRider  ?? null;
        state.verifyOtp.token     = action.payload.token    ?? null;
      },
    );

    // ── Verify OTP — FAIL ─────────────────────────────────────────────────────
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.VERIFY_OTP}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.verifyOtp.loading = false;
        state.verifyOtp.error   = action.payload;
      },
    );
  },
});

export const { resetSendOtp, resetVerifyOtp } = authSlice.actions;
export default authSlice.reducer;
