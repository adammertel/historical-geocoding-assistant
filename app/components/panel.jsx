import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';
import Menu from './menu';
import Button from './button';


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
      height: '94%',
      padding: 15
    }
  }

  render() {
    const store = appStore;
    
    return (
      <div className="panel-wrapper" style={this.style()} >
        <Menu label="record" defaultOpen={true}>
          <div>
            <div className="is-inline">
              <Button label="" icon="caret-left" onClick={appStore.previousRecord} />
              <h4 className="title is-4 is-inline has-text-centered" style={{margin: 5}}>
                {store.activeData['name']}
              </h4>
              <Button label="" icon="caret-right" onClick={appStore.nextRecord} className="is-pulled-right"/>
            </div>
            {
              Object.keys(store.activeData).map((column, ci) => {
                const value = store.activeData[column];
                return (<div key={ci}>{column + ' : ' + value}</div>);
              })
            }
          </div>
        </Menu>
      </div>
    )
  }
}