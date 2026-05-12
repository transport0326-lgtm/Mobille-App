import { call, put, takeLatest, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, API_ENDPOINTS, SUPPORT_BASE_URL } from '../../../config/api.config';

function* fetchUserSupportMessagesSaga(): Generator<any, void, any> {
  try {
    const response = yield call(apiRequest, API_ENDPOINTS.SUPPORT_MESSAGES, {
      method: 'GET',
    }, SUPPORT_BASE_URL);

    const raw: any[] = response.data?.messages ?? response.data ?? [];
    const messages = Array.isArray(raw)
      ? raw.map((m: any) => ({ ...m, text: m.text ?? m.message ?? '' }))
      : [];

    yield put({
      type: `${SagaActions.FETCH_USER_SUPPORT_MESSAGES}_${SagaActionType.SUCCESS}`,
      payload: messages,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.FETCH_USER_SUPPORT_MESSAGES}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to load messages.',
    });
  }
}

function* sendUserSupportMessageSaga({ payload }: any): Generator<any, void, any> {
  try {
    const body: Record<string, string> = { text: payload.text };
    if (payload.name) body.name = payload.name;

    yield call(apiRequest, API_ENDPOINTS.SUPPORT_MESSAGES, {
      method: 'POST',
      body: JSON.stringify(body),
    }, SUPPORT_BASE_URL);

    yield put({
      type: `${SagaActions.SEND_USER_SUPPORT_MESSAGE}_${SagaActionType.SUCCESS}`,
    });

    // send ke baad messages refresh karo
    yield put({
      type: `${SagaActions.FETCH_USER_SUPPORT_MESSAGES}_${SagaActionType.REQUEST}`,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.SEND_USER_SUPPORT_MESSAGE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to send message.',
    });
  }
}

function* fetchUserSupportMessagesWatcher() {
  yield takeLatest(
    `${SagaActions.FETCH_USER_SUPPORT_MESSAGES}_${SagaActionType.REQUEST}`,
    fetchUserSupportMessagesSaga,
  );
}

function* sendUserSupportMessageWatcher() {
  yield takeEvery(
    `${SagaActions.SEND_USER_SUPPORT_MESSAGE}_${SagaActionType.REQUEST}`,
    sendUserSupportMessageSaga,
  );
}

export function* rootUserSupportSaga() {
  yield spawn(fetchUserSupportMessagesWatcher);
  yield spawn(sendUserSupportMessageWatcher);
}

export default rootUserSupportSaga;