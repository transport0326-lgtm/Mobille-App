import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const fetchProfile = createAction(
  `${SagaActions.FETCH}_${SagaActions.PROFILE}_${SagaActionType.REQUEST}`,
  function prepare() {
    return { payload: undefined };
  },
);
