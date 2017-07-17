import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';
import Menu from './menu';


@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      position: 'absolute',
      top: '3%',
      right: '3%',
      zIndex: 9999,
      width: '300px',
      backgroundColor: 'white',
      opacity: .9,
      height: '94%'
    }
  }

  render() {
    const store = appStore;
    
    return (
      <div className="panel-wrapper" style={this.style()} >
        <Menu label="record">
          <div>
            {
              store.activeData.map((val, vi) => {
                return (<div key={vi}>{val}</div>);
              })
            }
            <button onClick={appStore.previousRecord} >previous record</button>
            <button onClick={appStore.nextRecord} >next record</button>
          </div>
        </Menu>
      </div>
    )
  }
}