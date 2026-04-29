import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest } from '../../../config/api.config';

function* fetchEarningsSaga(): Generator<any, void, any> {
  try {
    const response = yield call(apiRequest, 'bookings/rider/earnings', { method: 'GET' });
    yield put({
      type: `${SagaActions.RIDER_EARNINGS}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.RIDER_EARNINGS}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to load earnings.',
    });
  }
}

function* fetchEarningsWatcher() {
  yield takeLatest(
    `${SagaActions.RIDER_EARNINGS}_${SagaActionType.REQUEST}`,
    fetchEarningsSaga,
  );
}

export function* rootEarningsSaga() {
  yield spawn(fetchEarningsWatcher);
}

export default rootEarningsSaga;
