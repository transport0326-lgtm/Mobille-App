import { all, call } from 'redux-saga/effects';
import rootAuthSaga from './auth/authSaga';
import rootRegisterSaga from './register/registerSaga';
import rootBookingSaga from './booking/fareEstimateSaga';
import rootUploadSaga from './register/uploadSaga';
import rootProfileSaga from './profile/profileSaga';
import rootUpdateProfileSaga from './profile/updateProfileSaga';
import rootRiderProfileSaga from './profile/riderProfileSaga';
import rootUpdateRiderProfileSaga from './profile/updateRiderProfileSaga';
import rootUploadRiderPhotoSaga from './profile/uploadRiderPhotoSaga';
import rootAddBankDetailsSaga from './bank/addBankDetailsSaga';
import rootFetchBankDetailsSaga from './bank/fetchBankDetailsSaga';
import rootCreateBookingSaga from './booking/createBookingSaga';
import rootOrdersSaga from './booking/ordersSaga';
import rootGoOnlineSaga from './rider/goOnlineSaga';
import rootGoOfflineSaga from './rider/goOfflineSaga';
import rootAcceptBookingSaga from './rider/acceptBookingSaga';
import rootRiderHomeSaga from './rider/riderHomeSaga';
import rootRiderActiveSaga from './rider/riderActiveSaga';
import rootAddRatingSaga from './rating/ratingSaga';
import rootFetchNotificationsSaga from './notifications/riderNotificationsSaga';

// ─── Action name segments ─────────────────────────────────────────────────────

export enum SagaActions {
  FETCH           = 'FETCH',
  SEND            = 'SEND',
  SEND_OTP        = 'SEND_OTP',
  VERIFY_OTP      = 'VERIFY_OTP',
  REGISTER        = 'REGISTER',
  FARE_ESTIMATE   = 'FARE_ESTIMATE',
  UPLOAD_DOCUMENT = 'UPLOAD_DOCUMENT',
  PROFILE         = 'PROFILE',
  RIDER_PROFILE        = 'RIDER_PROFILE',
  UPLOAD_RIDER_PHOTO   = 'UPLOAD_RIDER_PHOTO',
  BANK_DETAILS         = 'BANK_DETAILS',
  CREATE_BOOKING       = 'CREATE_BOOKING',
  ORDERS               = 'ORDERS',
  GO_ONLINE            = 'GO_ONLINE',
  GO_OFFLINE           = 'GO_OFFLINE',
  ACCEPT_BOOKING       = 'ACCEPT_BOOKING',
  UPDATE               = 'UPDATE',
  CLEAR           = 'CLEAR',
  DELETE          = 'DELETE',
  DELETE_ACCOUNT  = 'DELETE_ACCOUNT',
  RIDER_HOME    =  'RIDER_HOME',
  RIDER_ACTIVE   =  'RIDER_ACTIVE',
  RATING   =  'RATING',
  NOTIFICATIONS   =  'NOTIFICATIONS',
}

export enum SagaActionType {
  REQUEST = 'REQUEST',
  SUCCESS = 'SUCCESS',
  FAIL    = 'FAIL',
}

// ─── Root saga ────────────────────────────────────────────────────────────────

export default function* rootSaga() {
  yield all([
    call(rootAuthSaga),
    call(rootRegisterSaga),
    call(rootBookingSaga),
    call(rootUploadSaga),
    call(rootProfileSaga),
    call(rootUpdateProfileSaga),
    call(rootRiderProfileSaga),
    call(rootUpdateRiderProfileSaga),
    call(rootUploadRiderPhotoSaga),
    call(rootAddBankDetailsSaga),
    call(rootFetchBankDetailsSaga),
    call(rootCreateBookingSaga),
    call(rootOrdersSaga),
    call(rootGoOnlineSaga),
    call(rootGoOfflineSaga),
    call(rootAcceptBookingSaga),
    call(rootRiderHomeSaga),
    call(rootRiderActiveSaga),
    call(rootAddRatingSaga),
    call(rootFetchNotificationsSaga),
  ]);
}
