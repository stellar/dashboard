import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";

import { RootState } from "config/store";

import { getErrorString } from "helpers/getErrorString";

import {
  ActionStatus,
  RejectMessage,
  DexDataInitialState,
  DexData,
} from "types";

export const fetchDexDataAction = createAsyncThunk<
  DexData,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>("dex/fetchDexDataAction", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("api/dex/all");
    const { tradesLast24H, paymentsLast24h, uniqueAssets, activeAccounts } =
      await response.json();

    return {
      trades: {
        fluctuation: new BigNumber(tradesLast24H.change || 0).toNumber(),
        last24HR: tradesLast24H.trades_last_24h,
        overall: tradesLast24H.overall,
      },
      payments24HRs: paymentsLast24h,
      totalUniqueAssets: uniqueAssets,
      dailyActiveAccounts: activeAccounts,
    };
  } catch (error) {
    return rejectWithValue({
      errorString: getErrorString(error),
    });
  }
});

const initialState: DexDataInitialState = {
  data: null,
  status: undefined,
  errorString: undefined,
};

const dexDataSlice = createSlice({
  name: "dex",
  initialState,
  reducers: {
    resetDexDataAction: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDexDataAction.pending, (state = initialState) => {
      state.status = ActionStatus.PENDING;
    });
    builder.addCase(fetchDexDataAction.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(fetchDexDataAction.rejected, (state, action) => {
      state.status = ActionStatus.ERROR;
      state.errorString = action.payload?.errorString;
    });
  },
});

export const dexDataSelector = (state: RootState) => state.dex;

export const { reducer } = dexDataSlice;
export const { resetDexDataAction } = dexDataSlice.actions;
