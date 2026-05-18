import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

export interface TodaySummary {
  earnings: number;
  trips: number;
  distanceKm: number;
}

export interface RiderHomeData {
  success: boolean;
  name: string;
  isOnline: boolean;
  isApproved: boolean;
  approvalStatus: string;
  rejectionReason: string | null;
  recentDeliveries: any[];
  todaySummary: TodaySummary;
}

interface RiderHomeState {
  data: RiderHomeData | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: RiderHomeState = {
  data: null,
  loading: false,
  success: false,
  error: null,
};

const riderHomeSlice = createSlice({
  name: 'riderHome',
  initialState,
  reducers: {
    resetRiderHome: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(`${SagaActions.RIDER_HOME}_${SagaActionType.REQUEST}`, state => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(`${SagaActions.RIDER_HOME}_${SagaActionType.SUCCESS}`, (state, action: any) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(`${SagaActions.RIDER_HOME}_${SagaActionType.FAIL}`, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetRiderHome } = riderHomeSlice.actions;
export default riderHomeSlice.reducer;
