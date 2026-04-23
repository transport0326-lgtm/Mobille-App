import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface GoOfflineState {
  loading: boolean;
  success: boolean;
  error:   string | null;
}

const initialState: GoOfflineState = {
  loading: false,
  success: false,
  error:   null,
};

const goOfflineSlice = createSlice({
  name: 'goOffline',
  initialState,
  reducers: {
    resetGoOffline(state) {
      state.loading = false;
      state.success = false;
      state.error   = null;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.GO_OFFLINE}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.success = false;
        state.error   = null;
      },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.GO_OFFLINE}_${SagaActionType.SUCCESS}`,
      state => {
        state.loading = false;
        state.success = true;
      },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.GO_OFFLINE}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export const { resetGoOffline } = goOfflineSlice.actions;
export default goOfflineSlice.reducer;
