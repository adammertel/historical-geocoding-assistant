import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';


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

  render() {
    const store = this.props.store;
    console.log(store.activeData);
    return (
      <div className="wrapper" style={this.style()} >
        {store.activeData.map((val, vi) => {
          console.log(val);
          return (<div key={vi}>{val}</div>);
        })}
        <button onClick={appStore.nextRecord} >next record</button>
      </div>
    )
  }
}