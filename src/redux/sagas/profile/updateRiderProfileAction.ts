import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface UpdateRiderProfilePayload {
  type: string;
  payload: {
    name: string;
    phone: string;
    email: string;
    vehicleNumber: string;
    emergencyContact: string;
  };
}

export const updateRiderProfile = createAction(
  `${SagaActions.UPDATE}_${SagaActions.RIDER_PROFILE}_${SagaActionType.REQUEST}`,
  function prepare(payload: UpdateRiderProfilePayload['payload']) {
    return { payload };
  },
);
