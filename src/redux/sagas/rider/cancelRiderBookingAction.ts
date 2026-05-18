import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface CancelRiderBookingPayload {
  type: string;
  payload: { bookingId: string; reason: string };
}

export const cancelRiderBooking = createAction(
  `${SagaActions.CANCEL_RIDER_BOOKING}_${SagaActionType.REQUEST}`,
  function prepare(payload: CancelRiderBookingPayload['payload']) {
    return { payload };
  },
);