import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { UploadRiderPhotoPayload } from './uploadRiderPhotoAction';

export function* uploadRiderPhotoSaga({ payload }: UploadRiderPhotoPayload): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.UPLOAD_RIDER_PHOTO}` });

  try {
    const formData = new FormData();
    formData.append('phone', payload.phone);
    formData.append('type',  'profile');
    formData.append('image', {
      uri:  payload.fileUri,
      name: payload.fileName,
      type: payload.fileType,
    } as any);

    const response = yield call(apiRequest, API_ENDPOINTS.UPLOAD_DOCUMENT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        Accept: 'application/json',
      },
      body: formData,
    });

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.UPLOAD_RIDER_PHOTO}_${SagaActionType.SUCCESS}`,
      payload: response.data?.url || '',
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.UPLOAD_RIDER_PHOTO}_${SagaActionType.FAIL}`,
      payload: error?.message || 'Failed to upload photo.',
    });
  }
}

export function* uploadRiderPhotoWatcher() {
  yield takeEvery(
    `${SagaActions.UPLOAD_RIDER_PHOTO}_${SagaActionType.REQUEST}`,
    uploadRiderPhotoSaga,
  );
}

export function* rootUploadRiderPhotoSaga() {
  yield spawn(uploadRiderPhotoWatcher);
}

export default rootUploadRiderPhotoSaga;
