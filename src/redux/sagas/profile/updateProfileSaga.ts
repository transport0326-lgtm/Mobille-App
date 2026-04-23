import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, USER_BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { UpdateProfilePayload } from './updateProfileAction';

export function* updateProfileSaga({ payload }: UpdateProfilePayload): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.UPDATE}_${SagaActions.PROFILE}` });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.PROFILE,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ name: payload.name, phone: payload.phone, email: payload.email }),
      },
      USER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.UPDATE}_${SagaActions.PROFILE}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });

    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.PROFILE}_${SagaActionType.REQUEST}`,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.UPDATE}_${SagaActions.PROFILE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to update profile.',
    });
  }
}

export function* updateProfileWatcher() {
  yield takeEvery(
    `${SagaActions.UPDATE}_${SagaActions.PROFILE}_${SagaActionType.REQUEST}`,
    updateProfileSaga,
  );
}

export function* rootUpdateProfileSaga() {
  yield spawn(updateProfileWatcher);
}

export default rootUpdateProfileSaga;
