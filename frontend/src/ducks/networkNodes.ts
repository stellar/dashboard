import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subYears } from "date-fns";

import { RootState } from "config/store";
import { networkConfig } from "constants/settings";
import { getErrorString } from "helpers/getErrorString";
import { getNetworkNodesHistoryData } from "helpers/getNetworkNodesHistoryData";

import {
  NetworkNodesInitialState,
  ActionStatus,
  RejectMessage,
  Network,
  NetworkNodesData,
  NetworkNodesType,
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
      const today = new Date();

      const historyParams = new URLSearchParams({
        from: subYears(today, 1).toISOString(),
        to: today.toISOString(),
      });

      const historyResponse = await fetch(
        `${networkConfig[network].stellarbeatUrl}/v1/month-statistics?${historyParams}`,
      );

      const { statistics } = await response.json();
      const history = await historyResponse.json();

      const historyData = getNetworkNodesHistoryData(history);

      return {
        watcherNodes: {
          current: statistics.nrOfActiveWatchers,
          historyStats: historyData[NetworkNodesType.WATCHER_NODES],
        },
        validatorNodes: {
          current: statistics.nrOfActiveValidators,
          historyStats: historyData[NetworkNodesType.VALIDATOR_NODES],
        },
        fullValidators: {
          current: statistics.nrOfActiveFullValidators,
          historyStats: historyData[NetworkNodesType.FULL_VALIDATORS],
        },
        organizations: {
          current: statistics.nrOfActiveOrganizations,
          historyStats: historyData[NetworkNodesType.ORGANIZATIONS],
        },
        topTierValidators: {
          current: statistics.topTierSize,
          historyStats: historyData[NetworkNodesType.TOP_TIER_VALIDATORS],
        },
        topTierOrganizations: {
          current: statistics.topTierOrgsSize,
          historyStats: historyData[NetworkNodesType.TOP_TIER_ORGANIZATIONS],
        },
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
