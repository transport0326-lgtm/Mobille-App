import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchBankDetails = createAction(
  `${SagaActions.FETCH}_${SagaActions.BANK_DETAILS}_${SagaActionType.REQUEST}`,
  function prepare() {
    return { payload: undefined };
  },
);
