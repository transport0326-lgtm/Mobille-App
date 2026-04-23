import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

function* ordersSaga(): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.FETCH_ORDERS,
      { method: 'GET' },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.ORDERS}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.ORDERS}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch orders.',
    });
  }
}

function* ordersWatcher() {
  yield takeLatest(`${SagaActions.ORDERS}_${SagaActionType.REQUEST}`, ordersSaga);
}

export function* rootOrdersSaga() {
  yield spawn(ordersWatcher);
}

export default rootOrdersSaga;
