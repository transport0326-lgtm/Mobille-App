import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { RegisterPayload } from './registerAction';

// ─── Register saga ────────────────────────────────────────────────────────────

export function* registerSaga({ payload }: RegisterPayload): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.REGISTER}` });

  try {
    const body: Record<string, string> = {
      phone:    payload.phone,
      name:     payload.name,
      email:    payload.email,
      userType: payload.userType,
    };

    if (payload.userType === 'rider') {
      if (payload.vehicleType)   body.vehicleType   = payload.vehicleType;
      if (payload.vehicleNumber) body.vehicleNumber = payload.vehicleNumber;
      if (payload.dlNumber)      body.dlNumber      = payload.dlNumber;
      if (payload.rcNumber)      body.rcNumber      = payload.rcNumber;
    }

    const response = yield call(apiRequest, API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.REGISTER}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.REGISTER}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Registration failed. Please try again.',
    });
  }
}

// ─── Watcher ──────────────────────────────────────────────────────────────────

export function* registerWatcher() {
  yield takeEvery(
    `${SagaActions.REGISTER}_${SagaActionType.REQUEST}`,
    registerSaga,
  );
}

// ─── Root register saga ───────────────────────────────────────────────────────

export function* rootRegisterSaga() {
  yield spawn(registerWatcher);
}

export default rootRegisterSaga;
