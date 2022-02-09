import { SectionCard } from "frontend/components/SectionCard";

import "./styles.scss";

export const LastLedgersInfo = () => (
  <SectionCard
    title="Last 10 Ledgers Info"
    titleLinkLabel="API"
    titleLink="https://horizon.stellar.org/operations?order=desc&limit=20"
  >
    Last 10 ledgers info content
  </SectionCard>
);
