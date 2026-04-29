import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { loadToken } from '../../../utils/tokenStorage';

function* rejectBookingSaga({ payload }: any): Generator<any, void, any> {
  try {
    const token: string | null = yield call(loadToken);
    if (!token) {
      yield put({
        type: `${SagaActions.REJECT_BOOKING}_${SagaActionType.FAIL}`,
        payload: 'No auth token available.',
      });
      return;
    }

    const response = yield call(
      apiRequest,
      `${API_ENDPOINTS.BOOKING_STATUS}/${payload.bookingId}/reject`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reason: payload.reason }),
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.REJECT_BOOKING}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.REJECT_BOOKING}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to reject booking.',
    });
  }
}

function* rejectBookingWatcher() {
  yield takeLatest(
    `${SagaActions.REJECT_BOOKING}_${SagaActionType.REQUEST}`,
    rejectBookingSaga,
  );
}

export function* rootRejectBookingSaga() {
  yield spawn(rejectBookingWatcher);
}

export default rootRejectBookingSaga;
