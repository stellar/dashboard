import StellarSdk from "stellar-sdk";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  RejectMessage,
  ActionStatus,
  OperationsInitialState,
  OperationsResponse,
  FetchLastOperationsActionResponse,
  Network,
} from "types";
import { RootState } from "config/store";
import { getErrorString } from "helpers/getErrorString";
import { getDateDiffSeconds } from "helpers/getDateDiffSeconds";
import { networkConfig } from "constants/settings";

export const fetchLastOperationsAction = createAsyncThunk<
  Array<FetchLastOperationsActionResponse>,
  void,
  { rejectValue: RejectMessage; state: RootState }
>("operations/fetchLastOperationsAction", async (_, { rejectWithValue }) => {
  try {
    const server = new StellarSdk.Server(networkConfig[Network.MAINNET].url);

    const operations = await server.operations().order("desc").limit(10).call();

    const { records } = operations as OperationsResponse;

    const result = records.map((record) => {
      const timeAgo = getDateDiffSeconds(String(new Date()), record.created_at);

      const operationType =
        record.type === "create_passive_offer" ? "passive_offer" : record.type;

      return {
        id: record.id,
        type: operationType,
        source_account: record.source_account,
        amount: Number(record.amount),
        offer_id: Number(record.offer_id),
        buying_asset_type: record.buying_asset_type,
        buying_asset_issuer: record.buying_asset_issuer,
        buying_asset_code: record.buying_asset_code,
        selling_asset_code: record.selling_asset_code,
        selling_asset_issuer: record.selling_asset_issuer,
        selling_asset_type: record.selling_asset_type,
        to: record.to,
        asset_type: record.asset_type,
        asset_code: record.asset_code,
        asset_issuer: record.asset_issuer,
        source_asset_type: record.source_asset_type,
        source_asset_issuer: record.source_asset_issuer,
        source_asset_code: record.source_asset_code,
        trustor: record.trustor,
        timeAgo,
      };
    });

    return result;
  } catch (error) {
    return rejectWithValue({ errorString: getErrorString(error) });
  }
});

const initialState: OperationsInitialState = {
  lastOperations: [],
  status: undefined,
  errorString: undefined,
};

const operationsSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {
    resetOperationsAction: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchLastOperationsAction.pending,
      (state = initialState) => {
        state.status = ActionStatus.PENDING;
      },
    );
    builder.addCase(fetchLastOperationsAction.fulfilled, (state, action) => {
      state.lastOperations = action.payload;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(fetchLastOperationsAction.rejected, (state, action) => {
      state.errorString = action.payload?.errorString;
      state.status = ActionStatus.ERROR;
    });
  },
});

export const operationsSelector = (state: RootState) => state.operations;

export const { reducer } = operationsSlice;
export const { resetOperationsAction } = operationsSlice.actions;
