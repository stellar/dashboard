import { Horizon } from "@stellar/stellar-sdk";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { RootState } from "config/store";
import { getErrorString } from "helpers/getErrorString";
import {
  ActionStatus,
  AverageTransactionFeeData,
  FeeStatsData,
  FeeStatsInitialState,
  Network,
  RejectMessage,
} from "types";
import { networkConfig } from "constants/settings";
import { formatBigNumbers } from "helpers/formatBigNumbers";

export const fetchFeeStatsDataAction = createAsyncThunk<
  FeeStatsData,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>("feeStats/fetchFeeStatsDataAction", async (_, { rejectWithValue }) => {
  try {
    const server = new Horizon.Server(networkConfig[Network.MAINNET].url);
    const response = await server.feeStats();

    return response;
  } catch (error) {
    return rejectWithValue({
      errorString: getErrorString(error),
    });
  }
});

export const fetchAverageTransactionsFeeData = createAsyncThunk<
  AverageTransactionFeeData,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "feeStats/fetchAverageTransactionsFeeData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("api/fees/stats");

      const { day, month } = await response.json();

      const formattedMonthlyFee = month.map(
        (fee: { closing_date: string; fee_average: string }) => ({
          date: `${fee.closing_date} 00:00:00`,
          primaryValue: formatBigNumbers(fee.fee_average),
        }),
      );

      const formattedDailyFee = day.map(
        (fee: { closing_hour: string; fee_average: string }) => ({
          date: fee.closing_hour.replace("T", " ").replace(".000Z", ""),
          primaryValue: formatBigNumbers(fee.fee_average),
        }),
      );

      return { month: formattedMonthlyFee, day: formattedDailyFee };
    } catch (error) {
      return rejectWithValue({
        errorString: getErrorString(error),
      });
    }
  },
);

const initialState: FeeStatsInitialState = {
  data: null,
  fees: null,
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
    builder.addCase(
      fetchAverageTransactionsFeeData.pending,
      (state = initialState) => {
        state.status = ActionStatus.PENDING;
      },
    );
    builder.addCase(
      fetchAverageTransactionsFeeData.fulfilled,
      (state, action) => {
        state.fees = action.payload;
        state.status = ActionStatus.SUCCESS;
      },
    );
    builder.addCase(
      fetchAverageTransactionsFeeData.rejected,
      (state, action) => {
        state.status = ActionStatus.ERROR;
        state.errorString = action.payload?.errorString;
      },
    );
  },
});

export const feeStatsSelector = (state: RootState) => state.feeStats;

export const { reducer } = feeStatsSlice;
export const { resetFeeStatsAction } = feeStatsSlice.actions;
