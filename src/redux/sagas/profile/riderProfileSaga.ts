import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, RIDER_BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

export function* fetchRiderProfileSaga(): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.RIDER_PROFILE}` });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.RIDER_PROFILE,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
      RIDER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.RIDER_PROFILE}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.RIDER_PROFILE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch rider profile.',
    });
  }
}

export function* fetchRiderProfileWatcher() {
  yield takeEvery(
    `${SagaActions.FETCH}_${SagaActions.RIDER_PROFILE}_${SagaActionType.REQUEST}`,
    fetchRiderProfileSaga,
  );
}

export function* rootRiderProfileSaga() {
  yield spawn(fetchRiderProfileWatcher);
}

export default rootRiderProfileSaga;
