import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchRiderActive = createAction(
  `${SagaActions.RIDER_ACTIVE}_${SagaActionType.REQUEST}`,
);
