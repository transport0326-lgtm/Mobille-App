import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface GoOnlineState {
  loading: boolean;
  success: boolean;
  error:   string | null;
}

const initialState: GoOnlineState = {
  loading: false,
  success: false,
  error:   null,
};

const goOnlineSlice = createSlice({
  name: 'goOnline',
  initialState,
  reducers: {
    resetGoOnline(state) {
      state.loading = false;
      state.success = false;
      state.error   = null;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.GO_ONLINE}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.success = false;
        state.error   = null;
      },
    );

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.GO_ONLINE}_${SagaActionType.SUCCESS}`,
      state => {
        state.loading = false;
        state.success = true;
      },
    );

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.GO_ONLINE}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export const { resetGoOnline } = goOnlineSlice.actions;
export default goOnlineSlice.reducer;
