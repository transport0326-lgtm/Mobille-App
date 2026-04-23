import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchRiderHome = createAction(
  `${SagaActions.RIDER_HOME}_${SagaActionType.REQUEST}`,
);
