import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface AcceptBookingPayload {
  type: string;
  payload: { bookingId: string };
}

export const acceptBooking = createAction(
  `${SagaActions.ACCEPT_BOOKING}_${SagaActionType.REQUEST}`,
  function prepare(payload: AcceptBookingPayload['payload']) {
    return { payload };
  },
);
