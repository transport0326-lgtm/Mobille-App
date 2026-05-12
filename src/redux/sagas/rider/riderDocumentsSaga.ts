import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, RIDER_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

function* riderDocumentsSaga(): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.RIDER_DOCUMENTS,
      { method: 'GET' },
      RIDER_BASE_URL,
    );
    console.log('FULL RESPONSE ====>', JSON.stringify(response));

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.RIDER_DOCUMENTS}_${SagaActionType.SUCCESS}`,
      payload: (response.data as any)?.documents ?? null,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.RIDER_DOCUMENTS}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch documents.',
    });
  }
}

function* riderDocumentsWatcher() {
  console.log('WATCHER STARTED ====>', `${SagaActions.RIDER_DOCUMENTS}_${SagaActionType.REQUEST}`);
  yield takeLatest(`${SagaActions.RIDER_DOCUMENTS}_${SagaActionType.REQUEST}`, riderDocumentsSaga);
}

export function* rootRiderDocumentsSaga() {
  yield spawn(riderDocumentsWatcher);
}

export default rootRiderDocumentsSaga;
