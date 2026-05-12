// fetchUserSupportMessagesAction.ts
import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchUserSupportMessages = createAction(
  `${SagaActions.FETCH_USER_SUPPORT_MESSAGES}_${SagaActionType.REQUEST}`,
);

export const sendUserSupportMessage = createAction(
  `${SagaActions.SEND_USER_SUPPORT_MESSAGE}_${SagaActionType.REQUEST}`,
  (payload: { text: string; name?: string }) => ({ payload }),
);