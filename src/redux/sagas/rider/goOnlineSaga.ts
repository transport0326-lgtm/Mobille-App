import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, RIDER_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { GoOnlinePayload } from './goOnlineAction';

function* goOnlineSaga({ payload }: GoOnlinePayload): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.GO_ONLINE,
      {
        method: 'PATCH',
        body: JSON.stringify({
          lat: payload.lat,
          lng: payload.lng,
          ...(payload.fcmToken ? { fcmToken: payload.fcmToken } : {}),
        }),
      },
      RIDER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.GO_ONLINE}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.GO_ONLINE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to go online.',
    });
  }
}

function* goOnlineWatcher() {
  yield takeLatest(`${SagaActions.GO_ONLINE}_${SagaActionType.REQUEST}`, goOnlineSaga);
}

export function* rootGoOnlineSaga() {
  yield spawn(goOnlineWatcher);
}

export default rootGoOnlineSaga;
