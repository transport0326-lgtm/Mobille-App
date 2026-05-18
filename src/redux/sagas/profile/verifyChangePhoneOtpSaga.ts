import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { VerifyChangePhoneOtpPayload } from './changePhoneAction';

export function* verifyChangePhoneOtpSaga({ payload }: VerifyChangePhoneOtpPayload): Generator<any, void, any> {
  yield put({ type: `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_VERIFY_OTP}` });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.CHANGE_PHONE_VERIFY_OTP,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ newPhone: payload.newPhone, otp: payload.otp }),
      },
      BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_VERIFY_OTP}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_VERIFY_OTP}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to verify OTP.',
    });
  }
}

export function* verifyChangePhoneOtpWatcher() {
  yield takeEvery(
    `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_VERIFY_OTP}_${SagaActionType.REQUEST}`,
    verifyChangePhoneOtpSaga,
  );
}

export function* rootVerifyChangePhoneOtpSaga() {
  yield spawn(verifyChangePhoneOtpWatcher);
}

export default rootVerifyChangePhoneOtpSaga;
