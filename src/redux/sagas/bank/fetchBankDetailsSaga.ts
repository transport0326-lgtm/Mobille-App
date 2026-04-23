import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, RIDER_BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';

export function* fetchBankDetailsSaga(): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.FETCH}_${SagaActions.BANK_DETAILS}` });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.RIDER_BANK_DETAILS,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
      RIDER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.BANK_DETAILS}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.FETCH}_${SagaActions.BANK_DETAILS}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to fetch bank details.',
    });
  }
}

export function* fetchBankDetailsWatcher() {
  yield takeEvery(
    `${SagaActions.FETCH}_${SagaActions.BANK_DETAILS}_${SagaActionType.REQUEST}`,
    fetchBankDetailsSaga,
  );
}

export function* rootFetchBankDetailsSaga() {
  yield spawn(fetchBankDetailsWatcher);
}

export default rootFetchBankDetailsSaga;
