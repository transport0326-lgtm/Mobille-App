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
import rootUpdateBookingStatusSaga from './rider/riderArrivedSaga';
import rootVerifyBookingOtpSaga from './rider/verifyBookingOtpSaga';
import rootTrackBookingSaga from './booking/trackBookingSaga';
import rootFetchRiderTripsSaga from './rider/riderTripsSaga';
import rootDeleteAccountSaga from './deleteAccountSaga';
import rootMarkNotificationsReadSaga from './notifications/markNotificationsReadSaga';
import rootRejectBookingSaga from './rider/rejectBookingSaga';
import rootCancelBookingSaga from './booking/cancelBookingSaga';
import rootChatSaga from './chat/chatSaga';
import rootEarningsSaga from './rider/earningsSaga';
import rootRiderDocumentsSaga from './rider/riderDocumentsSaga';
import rootUserSupportSaga from './supportChat/userSupportSaga';

// ─── Action name segments ─────────────────────────────────────────────────────

export enum SagaActions {
  FETCH = 'FETCH',
  SEND = 'SEND',
  SEND_OTP = 'SEND_OTP',
  VERIFY_OTP = 'VERIFY_OTP',
  REGISTER = 'REGISTER',
  FARE_ESTIMATE = 'FARE_ESTIMATE',
  UPLOAD_DOCUMENT = 'UPLOAD_DOCUMENT',
  PROFILE = 'PROFILE',
  RIDER_PROFILE = 'RIDER_PROFILE',
  UPLOAD_RIDER_PHOTO = 'UPLOAD_RIDER_PHOTO',
  BANK_DETAILS = 'BANK_DETAILS',
  CREATE_BOOKING = 'CREATE_BOOKING',
  ORDERS = 'ORDERS',
  GO_ONLINE = 'GO_ONLINE',
  GO_OFFLINE = 'GO_OFFLINE',
  ACCEPT_BOOKING = 'ACCEPT_BOOKING',
  UPDATE = 'UPDATE',
  CLEAR = 'CLEAR',
  DELETE = 'DELETE',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  RIDER_HOME = 'RIDER_HOME',
  RIDER_ACTIVE = 'RIDER_ACTIVE',
  RATING = 'RATING',
  NOTIFICATIONS = 'NOTIFICATIONS',
  UPDATE_BOOKING_STATUS = 'UPDATE_BOOKING_STATUS',
  VERIFY_BOOKING_OTP = 'VERIFY_BOOKING_OTP',
  TRACK_BOOKING = 'TRACK_BOOKING',
  FETCH_RIDER_TRIPS = 'FETCH_RIDER_TRIPS',
  MARK_NOTIFICATION_READ = 'MARK_NOTIFICATION_READ',
  MARK_ALL_NOTIFICATIONS_READ = 'MARK_ALL_NOTIFICATIONS_READ',
  REJECT_BOOKING = 'REJECT_BOOKING',
  CANCEL_BOOKING = 'CANCEL_BOOKING',
  FETCH_MESSAGES = 'FETCH_MESSAGES',
  SEND_MESSAGE = 'SEND_MESSAGE',
  RIDER_EARNINGS = 'RIDER_EARNINGS',
  RIDER_DOCUMENTS = 'RIDER_DOCUMENTS',
  FETCH_USER_SUPPORT_MESSAGES = 'FETCH_USER_SUPPORT_MESSAGES',
  SEND_USER_SUPPORT_MESSAGE = 'SEND_USER_SUPPORT_MESSAGE',
}

export enum SagaActionType {
  REQUEST = 'REQUEST',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
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
    call(rootUpdateBookingStatusSaga),
    call(rootVerifyBookingOtpSaga),
    call(rootTrackBookingSaga),
    call(rootFetchRiderTripsSaga),
    call(rootDeleteAccountSaga),
    call(rootMarkNotificationsReadSaga),
    call(rootRejectBookingSaga),
    call(rootCancelBookingSaga),
    call(rootChatSaga),
    call(rootEarningsSaga),
    call(rootRiderDocumentsSaga),
    call(rootUserSupportSaga),
  ]);
}
