import { Icon } from "@stellar/design-system";
import { SectionCard } from "frontend/components/SectionCard";

import "./styles.scss";

export const LastLedger = () => (
  <SectionCard
    title="Last Ledger"
    titleIcon={<Icon.Box />}
    titleLinkLabel="Recent Ops"
    titleLink="https://horizon.stellar.org/operations?order=desc&limit=20"
  >
    Last ledger content
  </SectionCard>
);
