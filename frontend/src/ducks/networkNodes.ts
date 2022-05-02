import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { RootState } from "config/store";
import { networkConfig } from "constants/settings";
import { getErrorString } from "helpers/getErrorString";

import {
  NetworkNodesInitialState,
  ActionStatus,
  RejectMessage,
  Network,
  NetworkNodesData,
} from "types";

export const fetchNetworkNodesAction = createAsyncThunk<
  NetworkNodesData,
  Network,
  { rejectValue: RejectMessage; state: RootState }
>(
  "networkNodes/fetchNetworkNodesAction",
  async (network, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${networkConfig[network].stellarbeatUrl}/v1`,
      );
      const { statistics } = await response.json();

      return {
        watcherNodes: statistics.nrOfActiveWatchers,
        validatorNodes: statistics.nrOfActiveValidators,
        fullValidators: statistics.nrOfActiveFullValidators,
        organizations: statistics.nrOfActiveOrganizations,
        topTierValidators: statistics.topTierSize,
        topTierOrganizations: statistics.topTierOrgsSize,
      };
    } catch (error) {
      return rejectWithValue({
        errorString: getErrorString(error),
      });
    }
  },
);

const initialState: NetworkNodesInitialState = {
  data: null,
  status: undefined,
  errorString: undefined,
};

const networkNodesSlice = createSlice({
  name: "networkNodes",
  initialState,
  reducers: {
    resetNetworkNodesAction: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNetworkNodesAction.pending, (state = initialState) => {
      state.status = ActionStatus.PENDING;
    });
    builder.addCase(fetchNetworkNodesAction.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(fetchNetworkNodesAction.rejected, (state, action) => {
      state.status = ActionStatus.ERROR;
      state.errorString = action.payload?.errorString;
    });
  },
});

export const networkNodesSelector = (state: RootState) => state.ledgers;

export const { reducer } = networkNodesSlice;
export const { resetNetworkNodesAction } = networkNodesSlice.actions;
