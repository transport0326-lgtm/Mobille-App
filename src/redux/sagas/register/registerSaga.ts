import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, API_ENDPOINTS } from '../../../config/api.config';
import { RegisterPayload } from './registerAction';
import { saveToken, saveRole } from '../../../utils/tokenStorage';


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
      body: JSON.stringify(body),
    });

    if (!response) throw new Error('Empty response');

    if (response.data?.token) {
      try {
        yield call(saveToken, response.data.token);
        if (response.data.role) yield call(saveRole, response.data.role);
      } catch (storageError) {
        console.warn('[Register] Failed to persist token:', storageError);
      }
    }

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
