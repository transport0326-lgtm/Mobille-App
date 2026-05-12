import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchRiderDocuments = createAction(
  `${SagaActions.RIDER_DOCUMENTS}_${SagaActionType.REQUEST}`,
);
