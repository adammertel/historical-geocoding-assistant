import React from 'react';

import Base from './../base';

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

  render() {
    return (
      <div className="wrapper" style={this.style()} >
        TEST
      </div>
    )
  }
}