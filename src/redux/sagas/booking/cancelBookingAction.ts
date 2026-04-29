import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface CancelBookingPayload {
  type: string;
  payload: { bookingId: string; reason: string };
}

export const cancelBooking = createAction(
  `${SagaActions.CANCEL_BOOKING}_${SagaActionType.REQUEST}`,
  function prepare(payload: CancelBookingPayload['payload']) {
    return { payload };
  },
);
