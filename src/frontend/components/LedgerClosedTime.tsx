import { Icon } from "@stellar/design-system";

enum ClosedStatus {
  NORMAL = "normal",
  SLOW = "slow",
  VERY_SLOW = "verySlow",
}

const getLedgerClosedStatus = (closedTime: number) => {
  if (closedTime <= 6) {
    return ClosedStatus.NORMAL;
  }

  if (closedTime <= 10) {
    return ClosedStatus.SLOW;
  }

  return ClosedStatus.VERY_SLOW;
};

export const LedgerClosedTime = ({ closedTime }: { closedTime: number }) => (
  <div className="LedgerClosedTime">
    {`closed in ${closedTime}s`}{" "}
    <Icon.Clock
      className={`LedgerClosedTime--${getLedgerClosedStatus(closedTime)}`}
    />
  </div>
);
