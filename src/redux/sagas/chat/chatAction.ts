import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchMessages = createAction(
  `${SagaActions.FETCH_MESSAGES}_${SagaActionType.REQUEST}`,
  (payload: { bookingId: string }) => ({ payload }),
);

export const sendMessage = createAction(
  `${SagaActions.SEND_MESSAGE}_${SagaActionType.REQUEST}`,
  (payload: { bookingId: string; text: string; senderRole: 'customer' | 'rider' }) => ({ payload }),
);
