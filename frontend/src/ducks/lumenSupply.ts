import StellarSdk from "stellar-sdk";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";

import { RootState } from "config/store";
import {
  networkConfig,
  FRIENDBOT_PUBLIC_ADDRESS,
  FRIENDBOT_STARTING_BALANCE,
} from "constants/settings";
import { getErrorString } from "helpers/getErrorString";

import {
  LumenSupplyInitialState,
  ActionStatus,
  RejectMessage,
  Network,
  LumenSupplyData,
} from "types";

export const fetchLumenSupplyAction = createAsyncThunk<
  LumenSupplyData,
  Network,
  { rejectValue: RejectMessage; state: RootState }
>(
  "lumenSupply/fetchLumenSupplyAction",
  async (network, { rejectWithValue }) => {
    try {
      let total;
      let circulating;
      let nonCirculating;

      if (network === Network.TESTNET) {
        const server = new StellarSdk.Server(networkConfig[network].url);
        const { balances } = await server.loadAccount(FRIENDBOT_PUBLIC_ADDRESS);

        total = new BigNumber(FRIENDBOT_STARTING_BALANCE);
        nonCirculating = new BigNumber(balances[0].balance);
        circulating = total.minus(nonCirculating);
      } else {
        const response = await fetch("api/v3/lumens");
        const { totalSupply, circulatingSupply } = await response.json();

        total = new BigNumber(totalSupply);
        circulating = new BigNumber(circulatingSupply);
        nonCirculating = total.minus(circulatingSupply);
      }

      return {
        circulating: circulating.toString(),
        nonCirculating: nonCirculating.toString(),
        total: total.toString(),
      };
    } catch (error) {
      return rejectWithValue({
        errorString: getErrorString(error),
      });
    }
  },
);

const initialState: LumenSupplyInitialState = {
  data: null,
  status: undefined,
  errorString: undefined,
};

const lumenSupplySlice = createSlice({
  name: "lumenSupply",
  initialState,
  reducers: {
    resetLumenSupplyAction: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLumenSupplyAction.pending, (state = initialState) => {
      state.status = ActionStatus.PENDING;
    });
    builder.addCase(fetchLumenSupplyAction.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(fetchLumenSupplyAction.rejected, (state, action) => {
      state.status = ActionStatus.ERROR;
      state.errorString = action.payload?.errorString;
    });
  },
});

export const networkNodesSelector = (state: RootState) => state.ledgers;

export const { reducer } = lumenSupplySlice;
export const { resetLumenSupplyAction } = lumenSupplySlice.actions;
