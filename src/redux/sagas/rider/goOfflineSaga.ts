import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, RIDER_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

function* goOfflineSaga(): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.GO_OFFLINE,
      { method: 'PATCH' },
      RIDER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.GO_OFFLINE}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.GO_OFFLINE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to go offline.',
    });
  }
}

function* goOfflineWatcher() {
  yield takeLatest(`${SagaActions.GO_OFFLINE}_${SagaActionType.REQUEST}`, goOfflineSaga);
}

export function* rootGoOfflineSaga() {
  yield spawn(goOfflineWatcher);
}

export default rootGoOfflineSaga;
