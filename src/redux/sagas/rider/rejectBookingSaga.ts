import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import { AcceptBookingPayload } from './acceptBookingAction';

function* acceptBookingSaga({ payload }: AcceptBookingPayload): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      `bookings/${payload.bookingId}/accept`,
      { method: 'PATCH' },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.ACCEPT_BOOKING}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.ACCEPT_BOOKING}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to accept booking.',
    });
  }
}

function* acceptBookingWatcher() {
  yield takeLatest(`${SagaActions.ACCEPT_BOOKING}_${SagaActionType.REQUEST}`, acceptBookingSaga);
}

export function* rootAcceptBookingSaga() {
  yield spawn(acceptBookingWatcher);
}

export default rootAcceptBookingSaga;
