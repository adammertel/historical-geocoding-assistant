// @flow

import React from "react";
import { observer } from "mobx-react";

import ErrorBoundary from "./errorboundary";
import AppMap from "./map";
import Panel from "./panel";
import LayerControl from "./layercontrol";
import Settings from "./settings";
import LoadingStatus from "./loadingstatus";
import AppHider from "./apphider";
import TablePrompt from "./tableprompt";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="wrapper">
        <ErrorBoundary>
          <div className="content">
            {!store.isLoaded && <LoadingStatus />}
            {store.tablePrompt && <TablePrompt />}
            {!store.isLoaded && <AppHider />}
            {store.openedSettings && store.shouldRenderApp && <Settings />}
            {store.shouldRenderApp && <Panel />}
            {store.shouldRenderApp && <AppMap />}
            {store.shouldRenderApp && <LayerControl />}
          </div>
        </ErrorBoundary>
      </div>
    );
  }
}

export default observer(App);
