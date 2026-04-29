import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

function* trackBookingSaga({ payload }: any): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      `${API_ENDPOINTS.BOOKING_TRACK}/${payload.bookingId}/track`,
      {
        method: 'GET',
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.TRACK_BOOKING}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.TRACK_BOOKING}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to track booking.',
    });
  }
}

function* trackBookingWatcher() {
  yield takeLatest(
    `${SagaActions.TRACK_BOOKING}_${SagaActionType.REQUEST}`,
    trackBookingSaga,
  );
}

export function* rootTrackBookingSaga() {
  yield spawn(trackBookingWatcher);
}

export default rootTrackBookingSaga;