import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface SendChangePhoneOtpPayload {
  type: string;
  payload: {
    newPhone: string;
  };
}

export interface VerifyChangePhoneOtpPayload {
  type: string;
  payload: {
    newPhone: string;
    otp: string;
  };
}

export const sendChangePhoneOtp = createAction(
  `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_SEND_OTP}_${SagaActionType.REQUEST}`,
  function prepare(payload: SendChangePhoneOtpPayload['payload']) {
    return { payload };
  },
);

export const verifyChangePhoneOtp = createAction(
  `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_VERIFY_OTP}_${SagaActionType.REQUEST}`,
  function prepare(payload: VerifyChangePhoneOtpPayload['payload']) {
    return { payload };
  },
);
