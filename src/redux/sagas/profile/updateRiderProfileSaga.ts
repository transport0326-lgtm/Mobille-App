import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, RIDER_BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { UpdateRiderProfilePayload } from './updateRiderProfileAction';

export function* updateRiderProfileSaga({ payload }: UpdateRiderProfilePayload): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.UPDATE}_${SagaActions.RIDER_PROFILE}` });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.RIDER_PROFILE,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name:             payload.name,
          phone:            payload.phone,
          email:            payload.email,
          vehicleNumber:    payload.vehicleNumber,
          emergencyContact: payload.emergencyContact,
          ...(payload.profilePhotoUrl ? { profilePhotoUrl: payload.profilePhotoUrl } : {}),
        }),
      },
      RIDER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.UPDATE}_${SagaActions.RIDER_PROFILE}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });

    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.RIDER_PROFILE}_${SagaActionType.REQUEST}`,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.UPDATE}_${SagaActions.RIDER_PROFILE}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to update rider profile.',
    });
  }
}

export function* updateRiderProfileWatcher() {
  yield takeEvery(
    `${SagaActions.UPDATE}_${SagaActions.RIDER_PROFILE}_${SagaActionType.REQUEST}`,
    updateRiderProfileSaga,
  );
}

export function* rootUpdateRiderProfileSaga() {
  yield spawn(updateRiderProfileWatcher);
}

export default rootUpdateRiderProfileSaga;
