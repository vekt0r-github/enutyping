import React from "react";
import ReactDOM from 'react-dom';

import App from './components/App';

import { ConfigProvider } from "@/providers/config";
import { AppLocalizationProvider } from "@/providers/l10n";

ReactDOM.render(
  <ConfigProvider>
    <AppLocalizationProvider>
      <App />
    </AppLocalizationProvider>
  </ConfigProvider>,
  document.getElementById('root')
);
