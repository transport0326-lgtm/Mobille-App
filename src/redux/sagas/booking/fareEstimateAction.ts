import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface FareEstimatePayload {
  type: string;
  payload: {
    pickupLat:   number;
    pickupLng:   number;
    dropoffLat:  number;
    dropoffLng:  number;
    vehicleType: string;
  };
}

export const fareEstimate = createAction(
  `${SagaActions.FARE_ESTIMATE}_${SagaActionType.REQUEST}`,
  function prepare(payload: FareEstimatePayload['payload']) {
    return { payload };
  },
);
