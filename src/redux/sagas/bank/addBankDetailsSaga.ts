import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, RIDER_BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { AddBankDetailsPayload } from './addBankDetailsAction';

export function* addBankDetailsSaga({ payload }: AddBankDetailsPayload): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.BANK_DETAILS}` });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.RIDER_BANK,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          accountHolderName:    payload.accountHolderName,
          bankName:             payload.bankName,
          accountNumber:        payload.accountNumber,
          confirmAccountNumber: payload.confirmAccountNumber,
          ifscCode:             payload.ifscCode,
          upiId:                payload.upiId,
          accountType:          payload.accountType,
        }),
      },
      RIDER_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.BANK_DETAILS}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.BANK_DETAILS}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to save bank details.',
    });
  }
}

export function* addBankDetailsWatcher() {
  yield takeEvery(
    `${SagaActions.BANK_DETAILS}_${SagaActionType.REQUEST}`,
    addBankDetailsSaga,
  );
}

export function* rootAddBankDetailsSaga() {
  yield spawn(addBankDetailsWatcher);
}

export default rootAddBankDetailsSaga;
