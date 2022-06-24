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

type Props = { closedTime: number; showPrefix?: boolean };

export const LedgerClosedTime = ({ closedTime, showPrefix = true }: Props) => (
  <div className="LedgerClosedTime">
    {showPrefix && <>closed in {closedTime}s</>}
    <Icon.Clock
      className={`LedgerClosedTime__icon LedgerClosedTime__icon--${getLedgerClosedStatus(
        closedTime,
      )}`}
    />
  </div>
);
