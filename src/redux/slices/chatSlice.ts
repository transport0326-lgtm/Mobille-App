import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

export interface ChatMessage {
  _id: string;
  bookingId: string;
  senderRole: 'customer' | 'rider';
  text: string;
  createdAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  sending: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChat: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(`${SagaActions.FETCH_MESSAGES}_${SagaActionType.REQUEST}`, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(`${SagaActions.FETCH_MESSAGES}_${SagaActionType.SUCCESS}`, (state, action: any) => {
        state.loading = false;
        state.messages = action.payload ?? [];
      })
      .addCase(`${SagaActions.FETCH_MESSAGES}_${SagaActionType.FAIL}`, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(`${SagaActions.SEND_MESSAGE}_${SagaActionType.REQUEST}`, (state, action: any) => {
        state.sending = true;
        state.messages.push({
          _id: `temp_${Date.now()}`,
          bookingId: action.payload.bookingId,
          senderRole: action.payload.senderRole,
          text: action.payload.text,
          createdAt: new Date().toISOString(),
        });
      })
      .addCase(`${SagaActions.SEND_MESSAGE}_${SagaActionType.SUCCESS}`, state => {
        state.sending = false;
      })
      .addCase(`${SagaActions.SEND_MESSAGE}_${SagaActionType.FAIL}`, (state, action: any) => {
        state.sending = false;
        state.error = action.payload;
        state.messages = state.messages.filter(m => !m._id.startsWith('temp_'));
      });
  },
});

export const { clearChat } = chatSlice.actions;
export default chatSlice.reducer;
