import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface TrackBookingPayload {
  bookingId: string;
}

export const trackBooking = createAction(
  `${SagaActions.TRACK_BOOKING}_${SagaActionType.REQUEST}`,
  function prepare(payload: TrackBookingPayload) {
    return { payload };
  },
);