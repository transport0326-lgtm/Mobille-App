import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

export interface RiderDocument {
  number: string;
  photoUrl: string;
  status: string;
}

export interface RiderDocumentsData {
  drivingLicense: RiderDocument | null;
  rcCard: RiderDocument | null;
}

interface RiderDocumentsState {
  loading: boolean;
  data: RiderDocumentsData | null;
  error: string | null;
}

const initialState: RiderDocumentsState = {
  loading: false,
  data: null,
  error: null,
};

const riderDocumentsSlice = createSlice({
  name: 'riderDocuments',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.RIDER_DOCUMENTS}_${SagaActionType.REQUEST}`,
      state => {
        state.loading = true;
        state.error = null;
      },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.RIDER_DOCUMENTS}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.loading = false;
        state.data = action.payload;
      },
    );
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.RIDER_DOCUMENTS}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      },
    );
  },
});

export default riderDocumentsSlice.reducer;
