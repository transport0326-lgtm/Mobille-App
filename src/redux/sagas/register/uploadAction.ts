import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface UploadDocumentPayload {
  type: string;
  payload: {
    phone:    string;
    fileUri:  string;
    fileName: string;
    fileType: string;
    docType:  'dl' | 'rc';
  };
}

export const uploadDocument = createAction(
  `${SagaActions.UPLOAD_DOCUMENT}_${SagaActionType.REQUEST}`,
  function prepare(payload: UploadDocumentPayload['payload']) {
    return { payload };
  },
);

export const resetUpload = createAction(`${SagaActions.UPLOAD_DOCUMENT}_RESET`);
