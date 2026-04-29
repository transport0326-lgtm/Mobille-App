import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from './index';

export const deleteAccount = createAction<{ type: 'rider' | 'user' }>(
  `${SagaActions.DELETE_ACCOUNT}_${SagaActionType.REQUEST}`,
);
