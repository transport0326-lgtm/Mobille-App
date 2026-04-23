import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';

interface UploadRiderPhotoState {
  loading: boolean;
  url:     string | null;
  error:   string | null;
}

const initialState: UploadRiderPhotoState = {
  loading: false,
  url:     null,
  error:   null,
};

const uploadRiderPhotoSlice = createSlice({
  name: 'uploadRiderPhoto',
  initialState,
  reducers: {
    resetUploadRiderPhoto(state) {
      state.loading = false;
      state.url     = null;
      state.error   = null;
    },
  },
  extraReducers: builder => {

    // CLEAR (loading)
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CLEAR}_${SagaActions.UPLOAD_RIDER_PHOTO}`,
      state => {
        state.loading = true;
        state.url     = null;
        state.error   = null;
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.UPLOAD_RIDER_PHOTO}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        state.loading = false;
        state.url     = action.payload;
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) =>
        action.type === `${SagaActions.UPLOAD_RIDER_PHOTO}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        state.loading = false;
        state.error   = action.payload;
      },
    );
  },
});

export const { resetUploadRiderPhoto } = uploadRiderPhotoSlice.actions;
export default uploadRiderPhotoSlice.reducer;
