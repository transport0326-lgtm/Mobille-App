import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import { loadToken } from '../../../utils/tokenStorage';

function* cancelBookingSaga({ payload }: any): Generator<any, void, any> {
  try {
    const token: string | null = yield call(loadToken);
    if (!token) {
      yield put({
        type: `${SagaActions.CANCEL_BOOKING}_${SagaActionType.FAIL}`,
        payload: 'No auth token available.',
      });
      return;
    }

    const response = yield call(
      apiRequest,
      `bookings/${payload.bookingId}/cancel`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reason: payload.reason }),
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.CANCEL_BOOKING}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.CANCEL_BOOKING}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to cancel booking.',
    });
  }
}

function* cancelBookingWatcher() {
  yield takeLatest(
    `${SagaActions.CANCEL_BOOKING}_${SagaActionType.REQUEST}`,
    cancelBookingSaga,
  );
}

export function* rootCancelBookingSaga() {
  yield spawn(cancelBookingWatcher);
}

export default rootCancelBookingSaga;
