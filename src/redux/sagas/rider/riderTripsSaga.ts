import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

function* fetchRiderTripsSaga({ payload }: any): Generator<any, void, any> {
  try {
    const { period } = payload;

    const response = yield call(
      apiRequest,
      `${API_ENDPOINTS.BOOKINGS}/rider/trips?period=${period}`,
      {
        method: 'GET',
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.FETCH_RIDER_TRIPS}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });

    console.log('Rider Trips Success:', response);
  } catch (error: any) {
    yield put({
      type: `${SagaActions.FETCH_RIDER_TRIPS}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch rider trips',
    });
  }
} 

function* fetchRiderTripsWatcher() {
  yield takeLatest(
    `${SagaActions.FETCH_RIDER_TRIPS}_${SagaActionType.REQUEST}`,
    fetchRiderTripsSaga,
  );
}

export function* rootFetchRiderTripsSaga() {
  yield spawn(fetchRiderTripsWatcher);
}

export default rootFetchRiderTripsSaga;