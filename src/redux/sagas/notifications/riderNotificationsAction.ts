import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';


export const getNotifications = createAction(
  `${SagaActions.NOTIFICATIONS}_${SagaActionType.REQUEST}`
);