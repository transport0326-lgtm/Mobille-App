import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

function* verifyBookingOtpSaga({ payload }: any): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      `${API_ENDPOINTS.BOOKINGS}/${payload.bookingId}/verify-otp`,
      {
        method: 'POST',
        body: JSON.stringify({ otp: payload.otp }),
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.VERIFY_BOOKING_OTP}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.VERIFY_BOOKING_OTP}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to verify OTP.',
    });
  }
}

function* verifyBookingOtpWatcher() {
  yield takeLatest(
    `${SagaActions.VERIFY_BOOKING_OTP}_${SagaActionType.REQUEST}`,
    verifyBookingOtpSaga,
  );
}

export function* rootVerifyBookingOtpSaga() {
  yield spawn(verifyBookingOtpWatcher);
}

export default rootVerifyBookingOtpSaga;