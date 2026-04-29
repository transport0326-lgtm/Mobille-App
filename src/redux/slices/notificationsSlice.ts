import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface Notification {
  _id: string;
  userId: string;
  userType: string;
  type: string;
  title: string;
  message: string;
  data: {
    bookingId: string;
    bookingNumber: string;
    pickup: string;
    dropoff: string;
    fare: number;
    platformFee: number;
    vehicleType: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsState {
  loading: boolean;
  success: boolean;
  error: string | null;
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  loading: false,
  success: false,
  error: null,
  notifications: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotifications(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) =>
        action.type ===
        `${SagaActions.CLEAR}_${SagaActions.FETCH}_${SagaActions.NOTIFICATIONS}`,
      state => {
        state.loading = false;
        state.success = false;
        state.error = null;
        state.notifications = [];
        state.unreadCount = 0;
      },
    );
    builder.addMatcher(
      (action: any) =>
        action.type ===
        `${SagaActions.NOTIFICATIONS}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.success = false;
        state.error = null;
      },
    );
    builder.addMatcher(
      (action: any) =>
        action.type ===
        `${SagaActions.FETCH}_${SagaActions.NOTIFICATIONS}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.loading = false;
        state.success = true;
        state.notifications = action.payload?.notifications ?? [];
        state.unreadCount = action.payload?.unreadCount ?? 0;
      },
    );
    builder.addMatcher(
      (action: any) =>
        action.type ===
        `${SagaActions.FETCH}_${SagaActions.NOTIFICATIONS}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      },
    );

    // Mark one as read — optimistic update on REQUEST
    builder.addMatcher(
      (action: any) =>
        action.type ===
        `${SagaActions.MARK_NOTIFICATION_READ}_${SagaActionType.REQUEST}`,
      (state, action: any) => {
        const target = state.notifications.find(n => n._id === action.payload);
        if (target && !target.isRead) {
          target.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      },
    );

    // Mark all as read — optimistic update on REQUEST
    builder.addMatcher(
      (action: any) =>
        action.type ===
        `${SagaActions.MARK_ALL_NOTIFICATIONS_READ}_${SagaActionType.REQUEST}`,
      state => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      },
    );
  },
});

export const { resetNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;