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

export const LedgerClosedTime = ({ closedTime, showPrefix }: Props) => (
  <div className="LedgerClosedTime">
    {showPrefix && <span>closed in {closedTime}s</span>}
    <Icon.Clock
      className={`LedgerClosedTime--${getLedgerClosedStatus(closedTime)}`}
    />
  </div>
);

LedgerClosedTime.defaultProps = {
  showPrefix: true,
};
