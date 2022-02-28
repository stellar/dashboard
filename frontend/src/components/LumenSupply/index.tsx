import { useEffect } from "react";
import { SectionCard } from "components/SectionCard";

import "./styles.scss";

export const LumenSupply = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/v2/lumens");
        const data = await response.json();
        console.log("api response: ", data);
      } catch (e) {
        // do nothing
      }
    };

    fetchData();
  }, []);

  return (
    <SectionCard
      title="Total XLM Issued"
      titleLinkLabel="Lumen Supply Metrics"
      titleLink="https://developers.stellar.org/docs/glossary/lumen-supply/"
    >
      Total XLM issued content
    </SectionCard>
  );
};
