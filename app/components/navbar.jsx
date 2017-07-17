import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';


@observer
export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      position: 'absolute',
      top: 0,
      width: '100%',
      zIndex: 9999
    }
  }

  render() {
    const store = appStore;
    
    return (
      <div className="panel-wrapper" style={this.style()} >
        <nav className="navbar">
          <div className="navbar-brand">
            <a className="navbar-item">
              <img src="http://bulma.io/images/bulma-logo.png" alt="Bulma: a modern CSS framework based on Flexbox" width="112" height="28" />
            </a>
          </div>
        </nav>
      </div>
    )
  }
}