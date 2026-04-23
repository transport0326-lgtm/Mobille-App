import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { submitRating } from './ratingAction';

export function* addRatingSaga(
  action: ReturnType<typeof submitRating>
): Generator<any, void, any> {

  const { payload } = action;

  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.RATING}` });

  try {
    const response = yield call(
      apiRequest,
      API_ENDPOINTS.RATINGS,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          bookingId: payload.bookingId,
          stars: payload.stars,
          tags: payload.tags,
          comment: payload.comment,
        }),
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.RATING}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });

  } catch (error: any) {
    yield put({
      type: `${SagaActions.RATING}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to submit rating.',
    });
  }
}

export function* addRatingWatcher() {
  yield takeEvery(
    `${SagaActions.RATING}_${SagaActionType.REQUEST}` as string,
    addRatingSaga
  );
}

export function* rootAddRatingSaga() {
  yield spawn(addRatingWatcher);
}

export default rootAddRatingSaga;