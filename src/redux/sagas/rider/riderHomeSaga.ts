import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, RIDER_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

function* riderHomeSaga(): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.RIDER_HOME,
      {
        method: 'GET',
      },
      RIDER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.RIDER_HOME}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.RIDER_HOME}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch rider home data.',
    });
  }
}

function* riderHomeWatcher() {
  yield takeLatest(`${SagaActions.RIDER_HOME}_${SagaActionType.REQUEST}`, riderHomeSaga);
}

export function* rootRiderHomeSaga() {
  yield spawn(riderHomeWatcher);
}

export default rootRiderHomeSaga;
