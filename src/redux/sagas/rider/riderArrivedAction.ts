import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface UpdateBookingStatusPayload {
  bookingId: string;
  status: string;
}

export const updateBookingStatus = createAction(
  `${SagaActions.UPDATE_BOOKING_STATUS}_${SagaActionType.REQUEST}`,
  function prepare(payload: UpdateBookingStatusPayload) {
    return { payload };
  },
);