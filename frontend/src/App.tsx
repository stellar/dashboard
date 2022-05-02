import { Layout } from "@stellar/design-system";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { store } from "config/store";

import { NetworkSwitch } from "components/NetworkSwitch";
import { Content } from "components/Content";
import { AnnouncementsBanner } from "components/AnnouncementsBanner";

import "styles.scss";

export const App = () => (
  <Provider store={store}>
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
  </Provider>
);
