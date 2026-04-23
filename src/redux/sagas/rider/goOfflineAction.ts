import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const goOffline = createAction(
  `${SagaActions.GO_OFFLINE}_${SagaActionType.REQUEST}`,
);
