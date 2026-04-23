import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BASE_URL2 , getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

// ─────────────────────────────────────────────
// Saga
// ─────────────────────────────────────────────

export function* fetchNotificationsSaga(): Generator<any, void, any> {
  yield put({
    type: `${SagaActions.CLEAR}_${SagaActions.FETCH}_${SagaActions.NOTIFICATIONS}`,
  });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.NOTIFICATIONS,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
      BASE_URL2,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.NOTIFICATIONS}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });

  } catch (error: any) {
    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.NOTIFICATIONS}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch notifications.',
    });
  }
}

// ─────────────────────────────────────────────
// Watcher
// ─────────────────────────────────────────────

export function* fetchNotificationsWatcher() {
  yield takeEvery(
  `${SagaActions.NOTIFICATIONS}_${SagaActionType.REQUEST}`,
  fetchNotificationsSaga,
);
}

// ─────────────────────────────────────────────
// Root Saga
// ─────────────────────────────────────────────

export function* rootFetchNotificationsSaga() {
  yield spawn(fetchNotificationsWatcher);
}

export default rootFetchNotificationsSaga;