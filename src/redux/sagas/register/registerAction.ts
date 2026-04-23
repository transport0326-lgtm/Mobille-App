import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface RegisterPayload {
  type: string;
  payload: {
    phone:          string;
    name:           string;
    email:          string;
    userType:       'user' | 'rider';
    vehicleType?:   string;
    vehicleNumber?: string;
    dlNumber?:      string;
    rcNumber?:      string;
    deliveryState?: string;
  };
}

export const register = createAction(
  `${SagaActions.REGISTER}_${SagaActionType.REQUEST}`,
  function prepare(payload: RegisterPayload['payload']) {
    return { payload };
  },
);
