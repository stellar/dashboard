import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { AppDispatch } from "config/store";
import { SectionCard } from "components/SectionCard";
import { SimpleAreaChart } from "components/charts/SimpleAreaChart";
import { fetchNetworkNodesAction } from "ducks/networkNodes";
import { useRedux } from "hooks/useRedux";
import { ActionStatus, Network, NetworkNodesType } from "types";

import "./styles.scss";

type NodeItem = {
  id: NetworkNodesType;
  label: string;
};

export const NetworkNodes = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const { networkNodes } = useRedux("networkNodes");
  const { data } = networkNodes;
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNetworkNodesAction(network));
  }, [network, dispatch]);

  const nodes: NodeItem[] = [
    {
      id: NetworkNodesType.WATCHER_NODES,
      label: "Watcher Nodes",
    },
    {
      id: NetworkNodesType.VALIDATOR_NODES,
      label: "Validator Nodes",
    },
    {
      id: NetworkNodesType.FULL_VALIDATORS,
      label: "Full Validators",
    },
    {
      id: NetworkNodesType.ORGANIZATIONS,
      label: "Organizations",
    },
    {
      id: NetworkNodesType.TOP_TIER_VALIDATORS,
      label: "Top Tier Validators",
    },
    {
      id: NetworkNodesType.TOP_TIER_ORGANIZATIONS,
      label: "Top Tier Organizations",
    },
  ];

  return (
    <SectionCard
      title="Network Nodes"
      titleLinkLabel="Explore Nodes"
      titleLink={`https://stellarbeat.io/${
        network === Network.TESTNET ? "?network=test" : ""
      }`}
      isLoading={networkNodes.status === ActionStatus.PENDING}
      noData={!data}
      marginTop="1rem"
      noShadow={network === Network.MAINNET}
    >
      <div className="NetworkNodes">
        {data
          ? nodes.map((n) => (
              <div className="NetworkNodes__node" key={n.id}>
                <div className="NetworkNodes__node__label">{n.label}</div>
                <div className="NetworkNodes__node__chart">
                  <SimpleAreaChart data={data[n.id].historyStats} />
                </div>
                <div className="NetworkNodes__node__count">
                  {data[n.id].current}
                </div>
              </div>
            ))
          : null}
      </div>
    </SectionCard>
  );
};
