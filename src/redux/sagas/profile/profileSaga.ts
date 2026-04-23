import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, USER_BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

export function* fetchProfileSaga(): Generator<any, void, any> {
  const token = getAuthToken();

  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.PROFILE}` });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.PROFILE,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
      USER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.PROFILE}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.PROFILE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch profile',
    });
  }
}

export function* fetchProfileSagaWatcher() {
  yield takeEvery(
    `${SagaActions.FETCH}_${SagaActions.PROFILE}_${SagaActionType.REQUEST}`,
    fetchProfileSaga,
  );
}

export function* rootProfileSaga() {
  yield spawn(fetchProfileSagaWatcher);
}

export default rootProfileSaga;
