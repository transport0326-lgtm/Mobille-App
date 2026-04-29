import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchEarnings = createAction(
  `${SagaActions.RIDER_EARNINGS}_${SagaActionType.REQUEST}`,
);
