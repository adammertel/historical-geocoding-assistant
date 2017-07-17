import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';


@observer
export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    }
  }

  style() {
    return {
    }
  }

  toggleOpen() {
    console.log('toggleOpen');
    console.log(this.state.open);
    this.setState({open: !this.state.open});
  }

  render() {
    const store = appStore;
    
    return (
      <div className="menu-wrapper" style={this.style()} >
        <h4 className="menu-label" onClick={this.toggleOpen.bind(this)}>{this.props.label}</h4>
        {
          this.state.open ? this.props.children : null
        }
      </div>
    )
  }
}