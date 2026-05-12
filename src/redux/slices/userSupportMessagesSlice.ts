import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

const userSupportMessagesSlice = createSlice({
  name: 'userSupportMessages',
  initialState: {
    messages: [] as any[],
    loading: false,
    sendLoading: false,
    error: null as string | null,
    sendError: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── Fetch messages ──────────────────────────────────────────────────────
      .addMatcher(
        (action) => action.type === `${SagaActions.FETCH_USER_SUPPORT_MESSAGES}_${SagaActionType.REQUEST}`,
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type === `${SagaActions.FETCH_USER_SUPPORT_MESSAGES}_${SagaActionType.SUCCESS}`,
        (state, action: any) => {
          state.messages = Array.isArray(action.payload) ? action.payload : [];
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type === `${SagaActions.FETCH_USER_SUPPORT_MESSAGES}_${SagaActionType.FAIL}`,
        (state, action: any) => { state.loading = false; state.error = action.payload; }
      )
      // ── Send message ────────────────────────────────────────────────────────
      .addMatcher(
        (action) => action.type === `${SagaActions.SEND_USER_SUPPORT_MESSAGE}_${SagaActionType.REQUEST}`,
        (state) => { state.sendLoading = true; state.sendError = null; }
      )
      .addMatcher(
        (action) => action.type === `${SagaActions.SEND_USER_SUPPORT_MESSAGE}_${SagaActionType.SUCCESS}`,
        (state) => { state.sendLoading = false; }
      )
      .addMatcher(
        (action) => action.type === `${SagaActions.SEND_USER_SUPPORT_MESSAGE}_${SagaActionType.FAIL}`,
        (state, action: any) => { state.sendLoading = false; state.sendError = action.payload; }
      );
  },
});

export default userSupportMessagesSlice.reducer;