import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface UpdateProfilePayload {
  type: string;
  payload: {
    name: string;
    phone: string;
    email: string;
  };
}

export const updateProfile = createAction(
  `${SagaActions.UPDATE}_${SagaActions.PROFILE}_${SagaActionType.REQUEST}`,
  function prepare(payload: UpdateProfilePayload['payload']) {
    return { payload };
  },
);
