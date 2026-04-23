import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchOrders = createAction(
  `${SagaActions.ORDERS}_${SagaActionType.REQUEST}`,
);
