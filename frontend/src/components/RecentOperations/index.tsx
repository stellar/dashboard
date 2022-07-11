import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Table } from "@stellar/design-system";

import "./styles.scss";

import { useRedux } from "hooks/useRedux";
import { networkConfig } from "constants/settings";
import { SectionCard } from "components/SectionCard";
import { AccountBadge } from "components/AccountBadge";
import { OperationTypeColumn } from "./OperationTypeColumn";
import { fetchLastOperationsAction } from "ducks/operations";
import { FetchLastOperationsActionResponse, Network } from "types";

export const RecentOperations = () => {
  const { operations } = useRedux("operations");
  const dispatch = useDispatch();
  const horizonURL = "https://horizon.stellar.org";

  const labels = [
    {
      id: "source",
      label: "Source",
    },
    {
      id: "operation",
      label: "Operation",
    },
    {
      id: "details",
      label: "Details",
    },
    {
      id: "timeAgo",
      label: "Time ago",
    },
  ];

  const getLastOperations = useCallback(() => {
    dispatch(fetchLastOperationsAction());
  }, [dispatch]);

  useEffect(() => {
    getLastOperations();
    setInterval(getLastOperations, 10 * 1000);
  }, [dispatch, getLastOperations]);

  const renderOperations = (operation: FetchLastOperationsActionResponse) => {
    const operationLink = `${horizonURL}/operations/${operation.id}`;

    return (
      <>
        <td>
          <AccountBadge id={operation.source_account} horizonURL={horizonURL} />
        </td>
        <td>
          <a
            className="RecentOperations__TextLink"
            href={operationLink}
            target="_blank"
            rel="noreferrer"
          >
            {operation.type}
          </a>
        </td>
        <td>
          <OperationTypeColumn horizonURL={horizonURL} operation={operation} />
        </td>
        <td>{operation.timeAgo}s</td>
      </>
    );
  };

  return (
    <SectionCard
      title="Recent Operations: Live Network"
      titleLinkLabel="API"
      titleLink={`${
        networkConfig[Network.MAINNET].url
      }/operations?order=desc&limit=20`}
    >
      <Table
        id="last-10-operations"
        data={operations.lastOperations}
        columnLabels={labels}
        hideNumberColumn
        renderItemRow={renderOperations}
      />
    </SectionCard>
  );
};
