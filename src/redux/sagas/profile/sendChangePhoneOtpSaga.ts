import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { SendChangePhoneOtpPayload } from './changePhoneAction';

export function* sendChangePhoneOtpSaga({ payload }: SendChangePhoneOtpPayload): Generator<any, void, any> {
  yield put({ type: `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_SEND_OTP}` });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.CHANGE_PHONE_SEND_OTP,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ newPhone: payload.newPhone }),
      },
      BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_SEND_OTP}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_SEND_OTP}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to send OTP.',
    });
  }
}

export function* sendChangePhoneOtpWatcher() {
  yield takeEvery(
    `${SagaActions.POST}_${SagaActions.CHANGE_PHONE_SEND_OTP}_${SagaActionType.REQUEST}`,
    sendChangePhoneOtpSaga,
  );
}

export function* rootSendChangePhoneOtpSaga() {
  yield spawn(sendChangePhoneOtpWatcher);
}

export default rootSendChangePhoneOtpSaga;
