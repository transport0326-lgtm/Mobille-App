import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface RiderTripsPayload {
  period: 'today' | 'thisWeek' | 'allTime';
}

export const fetchRiderTrips = createAction(
  `${SagaActions.FETCH_RIDER_TRIPS}_${SagaActionType.REQUEST}`,
  function prepare(payload: RiderTripsPayload) {
    return { payload };
  },
);