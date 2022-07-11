import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  ledgerTransactionHistoryConfig,
  networkConfig,
} from "constants/settings";
import {
  TransactionsInitialState,
  Network,
  RejectMessage,
  ActionStatus,
  FetchTransactionsHistoryActionResponse,
} from "types";
import { RootState } from "config/store";
import { getErrorString } from "helpers/getErrorString";
import { parseDateFromFormat } from "helpers/parseDateFromFormat";
import { getDateDiffSeconds } from "helpers/getDateDiffSeconds";

export const fetchTransactionsHistoryMonthAction = createAsyncThunk<
  FetchTransactionsHistoryActionResponse,
  Network,
  { rejectValue: RejectMessage; state: RootState }
>(
  "transactions/fetchTransactionsHistoryAction",
  async (network, { rejectWithValue }) => {
    try {
      const historyFilter = ledgerTransactionHistoryConfig["30D"];

      const ledgersUrlRequest = `/api/ledgers${historyFilter.endpointPrefix}${networkConfig[network].ledgerTransactionsHistorySuffix}`;
      const response = await fetch(ledgersUrlRequest);

      const { data: ledgers } = await response.json();

      return {
        items: ledgers.map((ledger: Record<string, unknown>) => ({
          durationInSeconds: getDateDiffSeconds(
            ledger.end as string,
            ledger.start as string,
          ),
          date: parseDateFromFormat(
            ledger.date as string,
            "yyyy-MM-dd HH:mm:ss",
          ).toISOString(),
          txOperationCount: ledger.operation_count,
        })),
      };
    } catch (error) {
      return rejectWithValue({ errorString: getErrorString(error) });
    }
  },
);

const initialState: TransactionsInitialState = {
  transactionsHistory: {
    items: [],
  },
  status: undefined,
  errorString: undefined,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    resetTransactionsAction: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchTransactionsHistoryMonthAction.pending,
      (state = initialState) => {
        state.status = ActionStatus.PENDING;
      },
    );
    builder.addCase(
      fetchTransactionsHistoryMonthAction.fulfilled,
      (state, action) => {
        state.transactionsHistory = action.payload;
        state.status = ActionStatus.SUCCESS;
      },
    );
    builder.addCase(
      fetchTransactionsHistoryMonthAction.rejected,
      (state, action) => {
        state.errorString = action.payload?.errorString;
        state.status = ActionStatus.ERROR;
      },
    );
  },
});

export const transactionsSelector = (state: RootState) => state.transactions;

export const { reducer } = transactionsSlice;
export const { resetTransactionsAction } = transactionsSlice.actions;
