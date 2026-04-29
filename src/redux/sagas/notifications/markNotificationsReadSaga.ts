import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BASE_URL2 } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

function* markNotificationReadSaga({ payload }: any): Generator<any, void, any> {
  try {
    yield call(
      apiRequest,
      `${API_ENDPOINTS.NOTIFICATIONS}/${payload}/read`,
      { method: 'PATCH' },
      BASE_URL2,
    );
    yield put({
      type: `${SagaActions.MARK_NOTIFICATION_READ}_${SagaActionType.SUCCESS}`,
      payload,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.MARK_NOTIFICATION_READ}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to mark notification as read.',
    });
  }
}

function* markAllNotificationsReadSaga(): Generator<any, void, any> {
  try {
    yield call(
      apiRequest,
      'notifications/mark-all-read',
      { method: 'PATCH' },
      BASE_URL2,
    );
    yield put({
      type: `${SagaActions.MARK_ALL_NOTIFICATIONS_READ}_${SagaActionType.SUCCESS}`,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.MARK_ALL_NOTIFICATIONS_READ}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to mark all notifications as read.',
    });
  }
}

function* markNotificationReadWatcher() {
  yield takeEvery(
    `${SagaActions.MARK_NOTIFICATION_READ}_${SagaActionType.REQUEST}`,
    markNotificationReadSaga,
  );
}

function* markAllNotificationsReadWatcher() {
  yield takeEvery(
    `${SagaActions.MARK_ALL_NOTIFICATIONS_READ}_${SagaActionType.REQUEST}`,
    markAllNotificationsReadSaga,
  );
}

export function* rootMarkNotificationsReadSaga() {
  yield spawn(markNotificationReadWatcher);
  yield spawn(markAllNotificationsReadWatcher);
}

export default rootMarkNotificationsReadSaga;
