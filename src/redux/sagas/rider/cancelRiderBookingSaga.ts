import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import { loadToken } from '../../../utils/tokenStorage';

function* cancelRiderBookingSaga({ payload }: any): Generator<any, void, any> {
  try {
    const token: string | null = yield call(loadToken);
    if (!token) {
      yield put({
        type: `${SagaActions.CANCEL_RIDER_BOOKING}_${SagaActionType.FAIL}`,
        payload: 'No auth token available.',
      });
      return;
    }

    const response = yield call(
      apiRequest,
      `bookings/${payload.bookingId}/rider-cancel`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reason: payload.reason }),
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.CANCEL_RIDER_BOOKING}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.CANCEL_RIDER_BOOKING}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to cancel rider booking.',
    });
  }
}

function* cancelRiderBookingWatcher() {
  yield takeLatest(
    `${SagaActions.CANCEL_RIDER_BOOKING}_${SagaActionType.REQUEST}`,
    cancelRiderBookingSaga,
  );
}

export function* rootCancelRiderBookingSaga() {
  yield spawn(cancelRiderBookingWatcher);
}

export default rootCancelRiderBookingSaga;