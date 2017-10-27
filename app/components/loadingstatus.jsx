import React from 'react';
import { observer } from 'mobx-react';
import Message from './../bulma/message';

class LoadingStatus extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    const opacity = appStore.changingLoadingStatus ? 0.1 : 0.9;
    return {
      position: 'absolute',
      bottom: '5%',
      width: '80%',
      left: '10%',
      fontSize: 20,
      textAlign: 'center',
      opacity: opacity
    };
  }

  render() {
    return (
      <Message
        style={this.style()}
        classes="is-danger loading-message"
        body={<strong>{appStore.loadingMessage}</strong>}
      />
    );
  }
}

export default observer(LoadingStatus);
