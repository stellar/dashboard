import { SectionCard } from "frontend/components/SectionCard";

import "./styles.scss";

export const ByTheNumbers = () => (
  <SectionCard
    title="By the Numbers"
    titleLinkLabel="More stats"
    // TODO: update link
    titleLink="https://horizon.stellar.org/operations?order=desc&limit=20"
  >
    By the numbers content
  </SectionCard>
);
