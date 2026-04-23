import { createSlice } from '@reduxjs/toolkit';
import { SagaActions, SagaActionType } from '../sagas/index';
import { resetUpload } from '../sagas/register/uploadAction';

// ─── State ────────────────────────────────────────────────────────────────────

interface DocUploadState {
  loading: boolean;
  success: boolean;
  error:   string | null;
}

interface UploadState {
  dl: DocUploadState;
  rc: DocUploadState;
}

const docInitial: DocUploadState = { loading: false, success: false, error: null };

const initialState: UploadState = {
  dl: { ...docInitial },
  rc: { ...docInitial },
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {},
  extraReducers: builder => {

    // CLEAR (loading per doc type)
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.CLEAR}_${SagaActions.UPLOAD_DOCUMENT}`,
      (state, action: any) => {
        const doc = action.payload as 'dl' | 'rc';
        state[doc] = { loading: true, success: false, error: null };
      },
    );

    // SUCCESS
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.UPLOAD_DOCUMENT}_${SagaActionType.SUCCESS}`,
      (state, action: any) => {
        const doc = action.payload.docType as 'dl' | 'rc';
        state[doc] = { loading: false, success: true, error: null };
      },
    );

    // FAIL
    builder.addMatcher(
      (action: any) => action.type === `${SagaActions.UPLOAD_DOCUMENT}_${SagaActionType.FAIL}`,
      (state, action: any) => {
        const doc = action.payload.docType as 'dl' | 'rc';
        state[doc] = { loading: false, success: false, error: action.payload.message };
      },
    );

    // RESET
    builder.addMatcher(
      (action: any) => action.type === resetUpload.type,
      () => initialState,
    );
  },
});

export default uploadSlice.reducer;
