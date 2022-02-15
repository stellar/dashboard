import { Icon } from "@stellar/design-system";

enum ClosedStatus {
  NORMAl = "normal",
  SLOW = "slow",
  VERY_SLOW = "verySlow",
}

const getLedgerClosedStatus = (closedTime: number) => {
  if (closedTime <= 6) {
    return ClosedStatus.NORMAl;
  }

  if (closedTime <= 10) {
    return ClosedStatus.SLOW;
  }

  return ClosedStatus.VERY_SLOW;
};

export const LedgerClosedTime = ({ closedTime }: { closedTime: number }) => (
  <>
    {`closed in ${closedTime}s`}{" "}
    <Icon.Clock
      className={`LastLedger__closedTime--${getLedgerClosedStatus(closedTime)}`}
    />
  </>
);
