import {
  configureStore,
  isPlain,
  createAction,
  CombinedState,
} from "@reduxjs/toolkit";
import { combineReducers, Action } from "redux";
import BigNumber from "bignumber.js";

import { RESET_STORE_ACTION_TYPE } from "constants/settings";

import { reducer as ledgers } from "ducks/ledgers";
import { reducer as lumenSupply } from "ducks/lumenSupply";
import { reducer as networkNodes } from "ducks/networkNodes";
import { reducer as dex } from "ducks/dex";

export type RootState = ReturnType<typeof store.getState>;

const loggerMiddleware =
  (storeVal: any) => (next: any) => (action: Action<any>) => {
    console.log("Dispatching: ", action.type);
    const dispatchedAction = next(action);
    console.log("NEW STATE: ", storeVal.getState());
    return dispatchedAction;
  };

const isSerializable = (value: any) =>
  BigNumber.isBigNumber(value) || isPlain(value);

const reducers = combineReducers({
  ledgers,
  lumenSupply,
  networkNodes,
  dex,
});

export const resetStoreAction = createAction(RESET_STORE_ACTION_TYPE);

const rootReducer = (state: CombinedState<any>, action: Action) => {
  const newState = action.type === RESET_STORE_ACTION_TYPE ? undefined : state;
  return reducers(newState, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        isSerializable,
      },
    }).concat(loggerMiddleware),
});
