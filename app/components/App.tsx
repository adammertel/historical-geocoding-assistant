import React from "react";
import { observer } from "mobx-react-lite";

import {
  ErrorBoundary,
  AppMap,
  Panel,
  LayerControl,
  Settings,
  LoadingStatus,
  AppHider,
  TablePrompt,
} from "@/components";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface AppProps {
  // Add any props if needed
}

const App: React.FC<AppProps> = observer(() => {
  const store = (window as any).store;
  const clientId = (window as any).config.clientId;

  return (
    <div className="wrapper">
      <ErrorBoundary>
        <GoogleOAuthProvider clientId={clientId}>
          <div className="content">
            {!store.isLoaded && <LoadingStatus />}
            {store.tablePrompt && <TablePrompt />}
            {!store.isLoaded && <AppHider />}
            {store.openedSettings && store.shouldRenderApp && <Settings />}
            {store.shouldRenderApp && <Panel />}
            {store.shouldRenderApp && <AppMap />}
            {store.shouldRenderApp && <LayerControl />}
          </div>
        </GoogleOAuthProvider>
      </ErrorBoundary>
    </div>
  );
});

export default App;
