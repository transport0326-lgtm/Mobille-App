import { call, put, takeEvery, spawn, delay } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { SendOtpPayload, VerifyOtpPayload } from './authAction';
import { saveToken } from '../../../utils/tokenStorage';
import { setAuthToken } from '../../../config/api.config';

const TEST_PHONE = '9999999999';
export const TEST_OTP = '1234';

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export function* sendOtpSaga({ payload }: SendOtpPayload): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.SEND_OTP}` });

  if (payload.phone === TEST_PHONE) {
    yield delay(800);
    yield put({
      type: `${SagaActions.SEND_OTP}_${SagaActionType.SUCCESS}`,
      payload: { message: 'Test OTP sent successfully', phoneNumber: payload.phone },
    });
    return;
  }

  try {
    const response = yield call(apiRequest, API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ phone: payload.phone }),
    });

    yield put({
      type: `${SagaActions.SEND_OTP}_${SagaActionType.SUCCESS}`,
      payload: {
        message:     response.data?.message || 'OTP sent successfully',
        phoneNumber: payload.phone,
        otp:         String(response.data?.otp ?? ''),
      },
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.SEND_OTP}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to send OTP. Please try again.',
    });
  }
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export function* verifyOtpSaga({ payload }: VerifyOtpPayload): Generator<any, void, any> {
  if (payload.phone === TEST_PHONE) {
    if (payload.otp !== TEST_OTP) {
      yield put({
        type: `${SagaActions.VERIFY_OTP}_${SagaActionType.FAIL}`,
        payload: 'Invalid OTP. Please enter 1234.',
      });
      return;
    }
    yield delay(600);
    const mockToken = 'test-token-local';
    setAuthToken(mockToken);
    yield put({
      type: `${SagaActions.VERIFY_OTP}_${SagaActionType.SUCCESS}`,
      payload: { token: mockToken, isUser: true, message: 'Test login successful' },
    });
    return;
  }

  try {
    const response = yield call(apiRequest, API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        phone:    payload.phone,
        otp:      payload.otp,
        ...(payload.fcmToken ? { fcmToken: payload.fcmToken } : {}),
      }),
    });

    if (!response) throw new Error('Empty response');

    if (response.data?.token) {
      setAuthToken(response.data.token);
      try {
        yield call(saveToken, response.data.token);
      } catch (storageError) {
        console.warn('[Auth] Failed to persist token:', storageError);
      }
    }

    yield put({
      type: `${SagaActions.VERIFY_OTP}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.VERIFY_OTP}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to verify OTP. Please try again.',
    });
  }
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

export function* sendOtpWatcher() {
  yield takeEvery(
    `${SagaActions.SEND}_${SagaActions.SEND_OTP}_${SagaActionType.REQUEST}`,
    sendOtpSaga,
  );
}

export function* verifyOtpWatcher() {
  yield takeEvery(
    `${SagaActions.SEND}_${SagaActions.VERIFY_OTP}_${SagaActionType.REQUEST}`,
    verifyOtpSaga,
  );
}

// ─── Root auth saga ───────────────────────────────────────────────────────────

export function* rootAuthSaga() {
  yield spawn(sendOtpWatcher);
  yield spawn(verifyOtpWatcher);
}

export default rootAuthSaga;
