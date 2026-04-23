import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface CreateBookingPayload {
  pickupLocation: {
    address:     string;
    coordinates: { lat: number; lng: number };
  };
  dropoffLocation: {
    address:     string;
    coordinates: { lat: number; lng: number };
  };
  vehicleType:    string;
  receiverName:   string;
  receiverPhone:  string;
  parcelDetails?: string;
}

export const createBooking = createAction(
  `${SagaActions.CREATE_BOOKING}_${SagaActionType.REQUEST}`,
  function prepare(payload: CreateBookingPayload) {
    return { payload };
  },
);

export const resetCreateBooking = createAction(
  `${SagaActions.CLEAR}_${SagaActions.CREATE_BOOKING}`,
);
