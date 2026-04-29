import { call, put, takeLeading, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest } from '../../../config/api.config';

function* fetchMessagesSaga({ payload }: any): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      `chat/${payload.bookingId}/messages`,
      { method: 'GET' },
    );
    const raw = response.data?.messages ?? response.data ?? [];
    const messages = raw.map((m: any) => ({
      ...m,
      text: m.text ?? m.message ?? '',
      senderRole: m.senderType === 'user' ? 'customer' : (m.senderType ?? m.senderRole),
    }));
    yield put({
      type: `${SagaActions.FETCH_MESSAGES}_${SagaActionType.SUCCESS}`,
      payload: messages,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.FETCH_MESSAGES}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to load messages.',
    });
  }
}

function* sendMessageSaga({ payload }: any): Generator<any, void, any> {
  try {
    yield call(
      apiRequest,
      `chat/${payload.bookingId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ message: payload.text, senderRole: payload.senderRole }),
      },
    );
    yield put({ type: `${SagaActions.SEND_MESSAGE}_${SagaActionType.SUCCESS}` });
    // Refresh the message list after a successful send
    yield put({
      type: `${SagaActions.FETCH_MESSAGES}_${SagaActionType.REQUEST}`,
      payload: { bookingId: payload.bookingId },
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.SEND_MESSAGE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to send message.',
    });
  }
}

function* fetchMessagesWatcher() {
  yield takeLeading(
    `${SagaActions.FETCH_MESSAGES}_${SagaActionType.REQUEST}`,
    fetchMessagesSaga,
  );
}

function* sendMessageWatcher() {
  yield takeEvery(
    `${SagaActions.SEND_MESSAGE}_${SagaActionType.REQUEST}`,
    sendMessageSaga,
  );
}

export function* rootChatSaga() {
  yield spawn(fetchMessagesWatcher);
  yield spawn(sendMessageWatcher);
}

export default rootChatSaga;
