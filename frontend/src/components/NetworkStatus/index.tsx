import { useState, useEffect, useCallback } from "react";
import { Card, Tag } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import {
  fetchLedgersAction,
  startLedgerStreamingAction,
  stopLedgerStreamingAction,
} from "ducks/ledgers";
import { useRedux } from "hooks/useRedux";
import { Network } from "types";

import "./styles.scss";
import { getDateDiffSeconds } from "helpers/getDateDiffSeconds";

enum NetworkState {
  RUNNING = "running",
  SLOW = "slow",
  VERY_SLOW = "verySlow",
  DOWN = "down",
}

const networkInfo = {
  [NetworkState.RUNNING]: {
    message: "Up and running",
    variant: Tag.variant.success,
  },
  [NetworkState.SLOW]: {
    message: "Network slow",
    variant: Tag.variant.warning,
  },
  [NetworkState.VERY_SLOW]: {
    message: "Network very slow",
    variant: Tag.variant.error,
  },
  [NetworkState.DOWN]: {
    message: "Network (or monitoring node) down",
    variant: Tag.variant.default,
  },
};

const getNetworkState = (closedAgo: number, averageClosedTime: number) => {
  // If last ledger closed more than 90 seconds ago it means network is down
  if (closedAgo >= 90) {
    return NetworkState.DOWN;
  }

  // Now we check the average close time but we also need to check the latest
  // ledger close time because if there are no new ledgers it means that
  // network is slow or down.
  if (averageClosedTime <= 10 && closedAgo < 20) {
    return NetworkState.RUNNING;
  }

  if (averageClosedTime <= 15 && closedAgo < 40) {
    return NetworkState.SLOW;
  }

  return NetworkState.VERY_SLOW;
};

export const NetworkStatus = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const { ledgers } = useRedux("ledgers");
  const dispatch = useDispatch();

  const { isStreaming, lastLedgerRecords, protocolVersion, averageClosedTime } =
    ledgers;

  const [closedAgo, setClosedAgo] = useState(0);
  const { closedAt: lastLedgerClosedAt } = lastLedgerRecords[0] || {};
  const hasLastLedgerRecord = Boolean(lastLedgerRecords[0]);

  useEffect(() => {
    dispatch(fetchLedgersAction(network));

    return () => {
      dispatch(stopLedgerStreamingAction());
    };
  }, [network, dispatch]);

  const startStreaming = useCallback(() => {
    dispatch(startLedgerStreamingAction(network));
  }, [network, dispatch]);

  useEffect(() => {
    if (hasLastLedgerRecord && !isStreaming) {
      startStreaming();
    }
  }, [isStreaming, hasLastLedgerRecord, startStreaming]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastLedgerClosedAt) {
        const diff = getDateDiffSeconds(
          new Date().toString(),
          lastLedgerClosedAt,
        );
        setClosedAgo(diff);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [lastLedgerClosedAt]);

  const networkState = getNetworkState(closedAgo, averageClosedTime || 0);

  return (
    <Card>
      <div className="NetworkStatus">
        <div className="NetworkStatus__info">
          <div className="NetworkStatus__title">
            Protocol version: {protocolVersion}
          </div>
        </div>

        <div className="NetworkStatus__status">
          <div className="NetworkStatus__title">Network status:</div>
          <Tag variant={networkInfo[networkState].variant}>
            {networkInfo[networkState].message}
          </Tag>
        </div>
      </div>
    </Card>
  );
};
