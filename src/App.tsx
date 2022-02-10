import { Layout } from "@stellar/design-system";
import { BrowserRouter } from "react-router-dom";

import { NetworkSwitch } from "frontend/components/NetworkSwitch";
import { Content } from "frontend/components/Content";
import { AnnouncementsBanner } from "frontend/components/AnnouncementsBanner";

import "styles.scss";

export const App = () => (
  <BrowserRouter>
    <AnnouncementsBanner />
    <Layout.Header projectTitle="Dashboard" hasDarkModeToggle />
    <Layout.Content>
      <Layout.Inset>
        <NetworkSwitch />
        <Content />
      </Layout.Inset>
    </Layout.Content>
    <Layout.Footer gitHubLink="https://github.com/stellar/dashboard" />
  </BrowserRouter>
);
