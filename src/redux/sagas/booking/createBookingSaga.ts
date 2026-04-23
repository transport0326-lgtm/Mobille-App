import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, BOOKING_BASE_URL } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import type { CreateBookingPayload } from './createBookingAction';

interface CreateBookingAction {
  type:    string;
  payload: CreateBookingPayload;
}

export function* createBookingSaga({ payload }: CreateBookingAction): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.CREATE_BOOKING}` });

  try {
    const body: Record<string, unknown> = {
      pickupLocation:  payload.pickupLocation,
      dropoffLocation: payload.dropoffLocation,
      vehicleType:     payload.vehicleType,
      receiverName:    payload.receiverName,
      receiverPhone:   payload.receiverPhone,
    };

    if (payload.parcelDetails) {
      body.parcelDetails = payload.parcelDetails;
    }

    const response = yield call(
      apiRequest,
      API_ENDPOINTS.CREATE_BOOKING,
      {
        method: 'POST',
        body:   JSON.stringify(body),
      },
      BOOKING_BASE_URL,
    );

    if (!response) throw new Error('Empty response');

    yield put({
      type:    `${SagaActions.CREATE_BOOKING}_${SagaActionType.SUCCESS}`,
      payload: response.data,
    });
  } catch (error: any) {
    yield put({
      type:    `${SagaActions.CREATE_BOOKING}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to create booking.',
    });
  }
}

export function* createBookingWatcher() {
  yield takeEvery(
    `${SagaActions.CREATE_BOOKING}_${SagaActionType.REQUEST}`,
    createBookingSaga,
  );
}

export function* rootCreateBookingSaga() {
  yield spawn(createBookingWatcher);
}

export default rootCreateBookingSaga;
