import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchRiderProfile = createAction(
  `${SagaActions.FETCH}_${SagaActions.RIDER_PROFILE}_${SagaActionType.REQUEST}`,
  function prepare() {
    return { payload: undefined };
  },
);
