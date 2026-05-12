import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';
import rootSaga from './sagas/index';
import authReducer from './slices/authSlice';
import registerReducer from './slices/registerSlice';
import bookingReducer from './slices/bookingSlice';
import uploadReducer from './slices/uploadSlice';
import profileReducer from './slices/profileSlice';
import updateProfileReducer from './slices/updateProfileSlice';
import riderProfileReducer from './slices/riderProfileSlice';
import updateRiderProfileReducer from './slices/updateRiderProfileSlice';
import uploadRiderPhotoReducer from './slices/uploadRiderPhotoSlice';
import bankDetailsReducer from './slices/bankDetailsSlice';
import riderBankDetailsReducer from './slices/riderBankDetailsSlice';
import ordersReducer from './slices/ordersSlice';
import goOnlineReducer from './slices/goOnlineSlice';
import goOfflineReducer from './slices/goOfflineSlice';
import acceptBookingReducer from './slices/acceptBookingSlice';
import riderHomeReducer from './slices/riderHomeSlice';
import notificationReducer from './slices/notificationsSlice';
import riderActiveReducer from './slices/riderActiveSlice';
import updateBookingStatusReducer from './slices/updateBookingStatus';
import verifyBookingOtpReducer from './slices/verifyBookingOtpSlice';
import riderTripsReducer from './slices/riderTripsSlice';
import deleteAccountReducer from './slices/deleteAccountSlice';
import rejectBookingReducer from './slices/rejectBookingSlice';
import cancelBookingReducer from './slices/cancelBookingSlice';
import chatReducer from './slices/chatSlice';
import earningsReducer from './slices/earningsSlice';
import riderDocumentsReducer from './slices/riderDocumentsSlice';
import userSupportMessagesReducer from './slices/userSupportMessagesSlice';

const sagaMiddleware = createSagaMiddleware();

// ─── Dev-only logger ──────────────────────────────────────────────────────────
// Logs every action + state diff to the Metro / console output.
// Automatically stripped in production builds.
const loggerMiddleware = createLogger({
  collapsed: true,           // keep the console tidy
  diff: true,                // show only what changed in state
  timestamp: false,
});

// ─── Store ────────────────────────────────────────────────────────────────────

const store = configureStore({
  reducer: {
    auth: authReducer,
    register: registerReducer,
    booking: bookingReducer,
    upload: uploadReducer,
    profile: profileReducer,
    updateProfile: updateProfileReducer,
    riderProfile: riderProfileReducer,
    updateRiderProfile: updateRiderProfileReducer,
    uploadRiderPhoto: uploadRiderPhotoReducer,
    bankDetails: bankDetailsReducer,
    riderBankDetails: riderBankDetailsReducer,
    orders: ordersReducer,
    goOnline: goOnlineReducer,
    goOffline: goOfflineReducer,
    acceptBooking: acceptBookingReducer,
    riderHome: riderHomeReducer,
    notifications: notificationReducer,
    riderActive:riderActiveReducer,
    updateBookingStatus:updateBookingStatusReducer,
    verifyBookingOtp:verifyBookingOtpReducer,
    riderTrips:riderTripsReducer,
    deleteAccount: deleteAccountReducer,
    rejectBooking: rejectBookingReducer,
    cancelBooking: cancelBookingReducer,
    chat: chatReducer,
    earnings: earningsReducer,
    riderDocuments: riderDocumentsReducer,
    userSupportMessages: userSupportMessagesReducer,
  },
  middleware: getDefaultMiddleware => {
    const base = getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware);

    return __DEV__ ? base.concat(loggerMiddleware) : base;
  },
  devTools: __DEV__, // enables Redux DevTools Extension in React Native Debugger
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
