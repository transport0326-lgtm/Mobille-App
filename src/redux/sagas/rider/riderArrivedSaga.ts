import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { loadToken } from '../../../utils/tokenStorage';

function* updateBookingStatusSaga({ payload }: any): Generator<any, void, any> {
  try {
    const token: string | null = yield call(loadToken);
    if (!token) {
      yield put({
        type: `${SagaActions.RIDER_ACTIVE}_${SagaActionType.FAIL}`,
        payload: 'No auth token available.',
      });
      return;
    }
    const response = yield call(
      apiRequest,
      `${API_ENDPOINTS.BOOKING_STATUS}/${payload.bookingId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: payload.status }),
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.UPDATE_BOOKING_STATUS}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.UPDATE_BOOKING_STATUS}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to update booking status.',
    });
  }
}

function* updateBookingStatusWatcher() {
  yield takeLatest(
    `${SagaActions.UPDATE_BOOKING_STATUS}_${SagaActionType.REQUEST}`,
    updateBookingStatusSaga,
  );
}

export function* rootUpdateBookingStatusSaga() {
  yield spawn(updateBookingStatusWatcher);
}

export default rootUpdateBookingStatusSaga;