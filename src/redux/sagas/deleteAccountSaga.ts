import { call, put, takeLatest, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from './index';
import { apiRequest, RIDER_BASE_URL, USER_BASE_URL } from '../../config/api.config';

function* deleteAccountSaga(action: any): Generator<any, void, any> {
  try {
    const isRider = action.payload?.type === 'rider';

    const response = yield call(
      apiRequest,
      isRider ? 'riders/profile' : 'users/profile',
      { method: 'DELETE' },
      isRider ? RIDER_BASE_URL : USER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.DELETE_ACCOUNT}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.DELETE_ACCOUNT}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to delete account',
    });
  }
}

function* deleteAccountWatcher() {
  yield takeLatest(
    `${SagaActions.DELETE_ACCOUNT}_${SagaActionType.REQUEST}`,
    deleteAccountSaga,
  );
}

export function* rootDeleteAccountSaga() {
  yield spawn(deleteAccountWatcher);
}

export default rootDeleteAccountSaga;
