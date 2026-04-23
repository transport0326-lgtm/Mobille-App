import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface ratingPayload {
  bookingId: string;
  stars: number;
  tags: string[];
  comment: string;
}

export const submitRating = createAction(
  `${SagaActions.RATING}_${SagaActionType.REQUEST}`,
  (payload: ratingPayload) => ({ payload })
);