import { SectionCard } from "components/SectionCard";

import "./styles.scss";

export const LedgerInfo = () => (
  <SectionCard
    title="Ledger Info"
    titleLinkLabel="API"
    // TODO: update link
    titleLink="https://horizon.stellar.org/operations?order=desc&limit=20"
  >
    Ledger info content
  </SectionCard>
);
