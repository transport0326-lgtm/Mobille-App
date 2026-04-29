import { createAction } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../index';

export const markNotificationRead = createAction<string>(
  `${SagaActions.MARK_NOTIFICATION_READ}_${SagaActionType.REQUEST}`,
);

export const markAllNotificationsRead = createAction(
  `${SagaActions.MARK_ALL_NOTIFICATIONS_READ}_${SagaActionType.REQUEST}`,
);
