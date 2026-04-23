import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface AddBankDetailsPayload {
  type: string;
  payload: {
    accountHolderName:    string;
    bankName:             string;
    accountNumber:        string;
    confirmAccountNumber: string;
    ifscCode:             string;
    upiId:                string;
    accountType:          string;
  };
}

export const addBankDetails = createAction(
  `${SagaActions.BANK_DETAILS}_${SagaActionType.REQUEST}`,
  function prepare(payload: AddBankDetailsPayload['payload']) {
    return { payload };
  },
);
