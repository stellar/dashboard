import { Layout } from "@stellar/design-system";

// import { store } from "config/store";
// import { Network } from "components/Network";
// import { Header } from "components/Header";

// import { Dashboard } from "pages/Dashboard";
// import { NotFound } from "pages/NotFound";

import "styles.scss";

export const App = () => (
  <>
    <Layout.Header projectTitle="Dashboard" />
    <Layout.Content>Dashboard content</Layout.Content>
    <Layout.Footer gitHubLink="https://github.com/stellar/dashboard" />
  </>
);
