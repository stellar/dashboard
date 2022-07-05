import { AmountInfoCard } from "components/AmountInfoCard";
import { SectionCard } from "components/SectionCard";

import "./styles.scss";

export const XML = () => {
  return (
    <SectionCard title="XML">
      <div className="XMLContainer">
        <AmountInfoCard title="Average Transaction Fee" amount="0.0002 XML" />

        <AmountInfoCard title="Base operation fee" amount="0.00001 XML" />

        <AmountInfoCard title="Base reserve" amount="0.5 XML" />
      </div>
    </SectionCard>
  );
};
