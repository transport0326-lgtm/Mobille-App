import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface SendOtpPayload {
  type: string;
  payload: {
    phone: string;
  };
}

export interface VerifyOtpPayload {
  type: string;
  payload: {
    phone:     string;
    otp:       string;
    fcmToken?: string | null;
  };
}

export const sendOtp = createAction(
  `${SagaActions.SEND}_${SagaActions.SEND_OTP}_${SagaActionType.REQUEST}`,
  function prepare(payload: SendOtpPayload['payload']) {
    return { payload };
  },
);

export const verifyOtp = createAction(
  `${SagaActions.SEND}_${SagaActions.VERIFY_OTP}_${SagaActionType.REQUEST}`,
  function prepare(payload: VerifyOtpPayload['payload']) {
    return { payload };
  },
);
