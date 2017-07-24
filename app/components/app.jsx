import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';
import AppMap from './map';
import Panel from './panel';
import Navbar from './navbar';


@observer
export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      width: '100%',
      height: '100%'
    }
  }

  navStyle() {
    return {
      
    }
  }

  bodyStyle() {
    return {
      top: 55,
      position: 'absolute',
      bottom: 0,
      width: '100%'
    }
  }

  render() {
    const store = this.props.store;
    console.log(store.recordData);
    
    return (
      <div className="wrapper" style={this.style()} >
        <div style={this.navStyle()} >
          <Navbar />
        </div>
        <div style={this.bodyStyle()}>
          <Panel />
          <AppMap />
        </div>
      </div>
    )
  }
}