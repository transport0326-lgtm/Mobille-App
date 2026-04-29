import { call, put, takeEvery, spawn } from 'redux-saga/effects';
import { SagaActions, SagaActionType } from '../index';
import { apiRequest, getAuthToken } from '../../../config/api.config';
import API_ENDPOINTS from '../../../config/api.config';
import { UploadDocumentPayload } from './uploadAction';
import { BASE_URL } from '../../../config/api.config';

// ─── Upload document saga ─────────────────────────────────────────────────────

export function* uploadDocumentSaga({ payload }: UploadDocumentPayload): Generator<any, void, any> {
  yield put({ type: `${SagaActions.CLEAR}_${SagaActions.UPLOAD_DOCUMENT}`, payload: payload.docType });

  try {
    const formData = new FormData();
    formData.append('phone', payload.phone);
    formData.append('type',  payload.docType);
    formData.append('image', {
      uri:  payload.fileUri,
      name: payload.fileName,
      type: payload.fileType,
    } as any);

    const response = yield call(apiRequest, API_ENDPOINTS.UPLOAD_DOCUMENT, {
      method: 'POST',
      headers: {
        // Authorization: `Bearer ${getAuthToken()}`,
        Accept: 'application/json',
      },
      body: formData,
    },BASE_URL);

    if (!response) throw new Error('Empty response');

    yield put({
      type: `${SagaActions.UPLOAD_DOCUMENT}_${SagaActionType.SUCCESS}`,
      payload: { docType: payload.docType, data: response.data },
    });
  } catch (error: any) {
    yield put({
      type: `${SagaActions.UPLOAD_DOCUMENT}_${SagaActionType.FAIL}`,
      payload: { docType: payload.docType, message: error?.message || 'Upload failed.' },
    });
  }
}

// ─── Watcher ──────────────────────────────────────────────────────────────────

export function* uploadDocumentWatcher() {
  yield takeEvery(
    `${SagaActions.UPLOAD_DOCUMENT}_${SagaActionType.REQUEST}`,
    uploadDocumentSaga,
  );
}

// ─── Root upload saga ─────────────────────────────────────────────────────────

export function* rootUploadSaga() {
  yield spawn(uploadDocumentWatcher);
}

export default rootUploadSaga;
