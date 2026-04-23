import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { FareEstimatePayload } from './fareEstimateAction';

// ─── Fare estimate saga ───────────────────────────────────────────────────────

export function* fareEstimateSaga({ payload }: FareEstimatePayload): Generator<any, void, any> {
  console.log('[fareEstimateSaga] START', payload);
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.FARE_ESTIMATE}` });

  try {
    const params = new URLSearchParams({
      pickupLat:   String(payload.pickupLat),
      pickupLng:   String(payload.pickupLng),
      dropoffLat:  String(payload.dropoffLat),
      dropoffLng:  String(payload.dropoffLng),
      vehicleType: payload.vehicleType,
    }).toString();

    console.log('[fareEstimateSaga] calling', `${BOOKING_BASE_URL}/${API_ENDPOINTS.FARE_ESTIMATE}?${params}`);

    const response = yield call(
      apiRequest,
      `${API_ENDPOINTS.FARE_ESTIMATE}?${params}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    console.log('[fareEstimateSaga] SUCCESS', response.data);

    yield put({
      type: `${SagaActions.FARE_ESTIMATE}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    console.log('[fareEstimateSaga] FAIL', error?.message);
    yield put({
      type: `${SagaActions.FARE_ESTIMATE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch fare estimate.',
    });
  }
}

// ─── Watcher ──────────────────────────────────────────────────────────────────

export function* fareEstimateWatcher() {
  yield takeEvery(
    `${SagaActions.FARE_ESTIMATE}_${SagaActionType.REQUEST}`,
    fareEstimateSaga,
  );
}

// ─── Root booking saga ────────────────────────────────────────────────────────

export function* rootBookingSaga() {
  yield spawn(fareEstimateWatcher);
}

export default rootBookingSaga;
