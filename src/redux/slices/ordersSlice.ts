import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

export interface Booking {
  _id: string;
  bookingNumber?: string;
  pickupLocation?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  dropoffLocation?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  vehicleType?: string;
  fare?: number;
  total?: number;
  status?: string;
  createdAt?: string;
}

export interface OrderStats {
  totalOrders: number;
  delivered:   number;
  cancelled:   number;
}

interface OrdersState {
  loading:  boolean;
  bookings: Booking[];
  stats:    OrderStats;
  error:    string | null;
}

const initialState: OrdersState = {
  loading:  false,
  bookings: [],
  stats:    { totalOrders: 0, delivered: 0, cancelled: 0 },
  error:    null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.ORDERS}_${SagaActionType.REQUEST}`,
      state => {
        state.loading  = true;
        state.bookings = [];
        state.stats    = initialState.stats;
        state.error    = null;
      },
    );

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.ORDERS}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.loading  = false;
        state.bookings = action.payload?.bookings ?? [];
        state.stats    = action.payload?.stats    ?? initialState.stats;
      },
    );

    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.ORDERS}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export default ordersSlice.reducer;
