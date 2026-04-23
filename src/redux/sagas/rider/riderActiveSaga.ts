import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

function* riderActiveSaga(): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.RIDER_ACTIVE,
      {
        method: 'GET',
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.RIDER_ACTIVE}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.RIDER_ACTIVE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch rider home data.',
    });
  }
}

function* riderActiveWatcher() {
  yield takeLatest(`${SagaActions.RIDER_ACTIVE}_${SagaActionType.REQUEST}`, riderActiveSaga);
}

export function* rootRiderActiveSaga() {
  yield spawn(riderActiveWatcher);
}

export default rootRiderActiveSaga;
