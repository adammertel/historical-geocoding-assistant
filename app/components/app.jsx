import React from 'react';
import { observer } from 'mobx-react';

import AppMap from './map';
import Panel from './panel';
import LayerControl from './layercontrol';
import Settings from './settings';
import LoadingStatus from './loadingstatus';
import AppHider from './apphider';

@observer
class App extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      width: '100%',
      height: '100%'
    };
  }

  bodyStyle() {
    return {
      top: 0,
      position: 'absolute',
      bottom: 0,
      width: '100%'
    };
  }

  render() {
    return (
      <div className="wrapper" style={this.style()}>
        <div style={this.bodyStyle()}>
          {store.openedSettings && <Settings />}
          {!store.isLoaded && <LoadingStatus />}
          {!store.isLoaded && <AppHider />}
          {store.shouldRenderApp && <Panel />}
          {store.shouldRenderApp && <AppMap />}
          {store.shouldRenderApp && <LayerControl />}
        </div>
      </div>
    );
  }
}

export default observer(App);
