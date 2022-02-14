import StellarSdk from "stellar-sdk";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { RootState } from "frontend/config/store";
import { networkConfig } from "frontend/constants/settings";
import { getErrorString } from "frontend/helpers/getErrorString";
import { getAverageLedgerClosedTime } from "frontend/helpers/getAverageLedgerClosedTime";

import {
  LedgersInitialState,
  ActionStatus,
  RejectMessage,
  Network,
  LedgerRecord,
  LedgerItem,
} from "types";

const LIMIT = 200;
const LAST_SIZE = 11;

let ledgerStreamRunner: any;

const formatLedgerRecord = (record: LedgerRecord): LedgerItem => ({
  sequenceNumber: record.sequence,
  txCountSuccessful: record.successful_transaction_count,
  txCountFailed: record.failed_transaction_count,
  opCount: record.operation_count,
  closedAt: record.closed_at,
  protocolVersion: record.protocol_version,
});

type FetchLedgersActionResponse = {
  lastLedgerRecords: LedgerItem[];
  protocolVersion: number;
  ledgerClosedTimes: string[];
  averageClosedTime: number;
};

export const fetchLedgersAction = createAsyncThunk<
  FetchLedgersActionResponse,
  Network,
  { rejectValue: RejectMessage; state: RootState }
>("ledgers/fetchLedgersAction", async (network, { rejectWithValue }) => {
  const server = new StellarSdk.Server(networkConfig[network].url);

  try {
    const ledgerResponse = await server
      .ledgers()
      .limit(LIMIT)
      .order("desc")
      .call();

    const ledgerRecords: LedgerRecord[] = ledgerResponse.records;
    const ledgerClosedTimes = ledgerRecords.map((r) => r.closed_at);
    const averageClosedTime = getAverageLedgerClosedTime(ledgerClosedTimes);

    const lastLedgerRecords = ledgerRecords
      .slice(0, LAST_SIZE)
      .map((r) => formatLedgerRecord(r));

    const { protocolVersion } = lastLedgerRecords[0];

    return {
      lastLedgerRecords,
      protocolVersion,
      ledgerClosedTimes,
      averageClosedTime,
    };
  } catch (error) {
    return rejectWithValue({
      errorString: getErrorString(error),
    });
  }
});

export const startLedgerStreamingAction = createAsyncThunk<
  { isStreaming: boolean },
  Network,
  { rejectValue: RejectMessage; state: RootState }
>(
  "ledgers/startLedgerStreamingAction",
  (network, { rejectWithValue, dispatch }) => {
    const server = new StellarSdk.Server(networkConfig[network].url);

    try {
      ledgerStreamRunner = server
        .ledgers()
        .cursor("now")
        .stream({
          onmessage: (ledger: LedgerRecord) => {
            dispatch(updateLedgersAction(formatLedgerRecord(ledger)));
          },
          onerror: () => {
            // do nothing
          },
        });

      return {
        isStreaming: true,
      };
    } catch (error) {
      return rejectWithValue({
        errorString: getErrorString(error),
      });
    }
  },
);

const initialState: LedgersInitialState = {
  lastLedgerRecords: [],
  protocolVersion: null,
  ledgerClosedTimes: [],
  averageClosedTime: null,
  isStreaming: false,
  status: undefined,
  errorString: undefined,
};

const ledgersSlice = createSlice({
  name: "ledgers",
  initialState,
  reducers: {
    updateLedgersAction: (state, action) => {
      const { protocolVersion, closedAt } = action.payload as LedgerItem;
      const updatedClosedTimes = [
        closedAt,
        ...state.ledgerClosedTimes.slice(0, LIMIT - 1),
      ];

      return {
        ...state,
        lastLedgerRecords: [
          action.payload,
          ...state.lastLedgerRecords.slice(0, LAST_SIZE - 1),
        ],
        protocolVersion,
        ledgerClosedTimes: updatedClosedTimes,
        averageClosedTime: getAverageLedgerClosedTime(updatedClosedTimes),
      };
    },
    stopLedgerStreamingAction: () => {
      if (ledgerStreamRunner) {
        ledgerStreamRunner();
        ledgerStreamRunner = undefined;
      }

      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLedgersAction.pending, (state = initialState) => {
      state.status = ActionStatus.PENDING;
    });
    builder.addCase(fetchLedgersAction.fulfilled, (state, action) => {
      state.lastLedgerRecords = action.payload.lastLedgerRecords;
      state.protocolVersion = action.payload.protocolVersion;
      state.ledgerClosedTimes = action.payload.ledgerClosedTimes;
      state.averageClosedTime = action.payload.averageClosedTime;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(fetchLedgersAction.rejected, (state, action) => {
      state.status = ActionStatus.ERROR;
      state.errorString = action.payload?.errorString;
    });
  },
});

export const ledgersSelector = (state: RootState) => state.ledgers;

export const { reducer } = ledgersSlice;
export const { updateLedgersAction, stopLedgerStreamingAction } =
  ledgersSlice.actions;
