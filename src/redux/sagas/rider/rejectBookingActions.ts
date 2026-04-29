import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface RejectBookingPayload {
  bookingId: string;
  reason: string;
}

export const rejectBooking = createAction(
  `${SagaActions.REJECT_BOOKING}_${SagaActionType.REQUEST}`,
  function prepare(payload: RejectBookingPayload) {
    return { payload };
  },
);
