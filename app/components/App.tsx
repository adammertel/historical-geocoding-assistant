import { observer } from "mobx-react-lite";
import React from "react";

import {
  AppHider,
  AppMap,
  ErrorBoundary,
  LayerControl,
  LoadingStatus,
  Panel,
  Settings,
  TablePrompt,
} from "@/components";

interface AppProps {
  // Add any props if needed
}

const App: React.FC<AppProps> = observer(() => {
  const store = (window as any).store;

  return (
    <div className="wrapper">
      <ErrorBoundary>
        <div className="content">
          {!store.isLoaded && <LoadingStatus />}
          {store.tablePrompt && <TablePrompt />}
          {!store.isLoaded && <AppHider />}
          {store.openedSettings && store.shouldRenderApp && <Settings />}
          {store.shouldRenderApp && <Panel />}
          {/* {store.shouldRenderApp && <AppMap />} */}
          {/* {store.shouldRenderApp && <LayerControl />} */}
        </div>
      </ErrorBoundary>
    </div>
  );
});

export default App;
