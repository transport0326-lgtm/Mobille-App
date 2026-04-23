import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface ProfileState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data:    null,
  loading: false,
  error:   null,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: builder => {

    // REQUEST
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH}_${SagaActions.PROFILE}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.error   = null;
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH}_${SagaActions.PROFILE}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.data    = action.payload ?? null;
        state.loading = false;
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.FETCH}_${SagaActions.PROFILE}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload || 'Something went wrong';
      },
    );
  },
});

export default profileSlice.reducer;
