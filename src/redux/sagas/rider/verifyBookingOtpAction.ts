import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface VerifyOtpPayload {
  bookingId: string;
  otp: string;
}

export const verifyBookingOtp = createAction(
  `${SagaActions.VERIFY_BOOKING_OTP}_${SagaActionType.REQUEST}`,
  function prepare(payload: VerifyOtpPayload) {
    return { payload };
  },
);