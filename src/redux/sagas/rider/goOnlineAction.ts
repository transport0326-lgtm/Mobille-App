import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface GoOnlinePayload {
  type: string;
  payload: { lat: number; lng: number; fcmToken?: string };
}

export const goOnline = createAction(
  `${SagaActions.GO_ONLINE}_${SagaActionType.REQUEST}`,
  function prepare(payload: GoOnlinePayload['payload']) {
    return { payload };
  },
);
