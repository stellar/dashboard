import StellarSdk from "stellar-sdk";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "config/store";
import { getErrorString } from "helpers/getErrorString";
import {
  ActionStatus,
  FeeStatsData,
  FeeStatsDataInitialState,
  Network,
  RejectMessage,
} from "types";
import { networkConfig } from "constants/settings";

export const fetchFeeStatsDataAction = createAsyncThunk<
  FeeStatsData,
  void,
  { rejectValue: RejectMessage; state: RootState }
>("feeStats/fetchFeeStatsDataAction", async (_, { rejectWithValue }) => {
  try {
    const server = new StellarSdk.Server(networkConfig[Network.MAINNET].url);

    const response = server.feeStats();

    return response;
  } catch (error) {
    return rejectWithValue({
      errorString: getErrorString(error),
    });
  }
});

const initialState: FeeStatsDataInitialState = {
  data: null,
  status: undefined,
  errorString: undefined,
};

const feeStatsSlice = createSlice({
  name: "feeStats",
  initialState,
  reducers: {
    resetFeeStatsAction: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFeeStatsDataAction.pending, (state = initialState) => {
      state.status = ActionStatus.PENDING;
    });
    builder.addCase(fetchFeeStatsDataAction.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(fetchFeeStatsDataAction.rejected, (state, action) => {
      state.status = ActionStatus.ERROR;
      state.errorString = action.payload?.errorString;
    });
  },
});

export const feeStatsSelector = (state: RootState) => state.feeStats;

export const { reducer } = feeStatsSlice;
export const { resetFeeStatsAction } = feeStatsSlice.actions;
