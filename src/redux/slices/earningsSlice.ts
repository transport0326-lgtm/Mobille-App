import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

export interface DailyBreakdown {
  day: string;
  earnings: number;
  trips: number;
}

export interface EarningsSummary {
  tripFares: number;
  bonuses: number;
  tips: number;
  platformDeductions: number;
}

export interface EarningsData {
  success: boolean;
  thisWeek: { total: number; trips: number };
  dailyBreakdown: DailyBreakdown[];
  summary: EarningsSummary;
}

interface EarningsState {
  loading: boolean;
  data: EarningsData | null;
  error: string | null;
}

const initialState: EarningsState = {
  loading: false,
  data: null,
  error: null,
};

const earningsSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: {
    resetEarnings: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(`${SagaActions.RIDER_EARNINGS}_${SagaActionType.REQUEST}`, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(`${SagaActions.RIDER_EARNINGS}_${SagaActionType.SUCCESS}`, (state, action: any) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(`${SagaActions.RIDER_EARNINGS}_${SagaActionType.FAIL}`, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetEarnings } = earningsSlice.actions;
export default earningsSlice.reducer;
