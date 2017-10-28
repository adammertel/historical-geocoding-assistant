import React from 'react';
import { observer } from 'mobx-react';
import Message from './../bulma/message';

@observer
class LoadingStatus extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    const opacity = store.changingLoadingStatus ? 0 : 0.8;
    return {
      position: 'absolute',
      top: '0%',
      width: '100%',
      left: '0%',
      fontSize: 25,
      borderWidth: 0,
      textAlign: 'center',
      opacity: opacity
    };
  }

  render() {
    return (
      <Message
        style={this.style()}
        classes="is-primary is-transition loading-status"
        body={
          <div>
            <span className="icon is-medium is-primary">
              <i className="fa fa-cog fa-spin" />
            </span>
            <span style={{ verticalAlign: 'baseline', paddingLeft: 5 }}>
              <strong>{store.loadingMessage}</strong>
            </span>
          </div>
        }
      />
    );
  }
}

export default observer(LoadingStatus);
