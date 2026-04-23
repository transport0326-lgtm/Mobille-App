import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export interface UploadRiderPhotoPayload {
  type: string;
  payload: {
    phone:    string;
    fileUri:  string;
    fileName: string;
    fileType: string;
  };
}

export const uploadRiderPhoto = createAction(
  `${SagaActions.UPLOAD_RIDER_PHOTO}_${SagaActionType.REQUEST}`,
  function prepare(payload: UploadRiderPhotoPayload['payload']) {
    return { payload };
  },
);
