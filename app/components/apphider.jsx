import React from 'react';
import { observer } from 'mobx-react';

@observer
class AppHider extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    const opacity = store.changingLoadingStatus ? 0 : 0.3;
    return {
      backgroundColor: 'grey',
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      opacity: opacity,
      position: 'fixed',
      zIndex: 1200
    };
  }

  render() {
    return <div className="app-hider is-transition" style={this.style()} />;
  }
}

export default observer(AppHider);
