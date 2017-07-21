import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';
import Menu from './menu';
import Button from './button';
import Input from './input';


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
      width: '400px',
      backgroundColor: 'white',
      opacity: .9,
      height: '94%',
      padding: 15
    }
  }

  render() {
    const store = appStore;
    console.log(store.recordData)
    
    return (
      <div className="panel-wrapper" style={this.style()} >
        <div className="is-inline">
          <Button label="" icon="caret-left" onClick={appStore.previousRecord} />
          <h4 className="title is-4 is-inline has-text-centered" style={{margin: 5, fontWeight: 600}}>
            {store.recordName}
          </h4>
          <Button label="" icon="caret-right" onClick={appStore.nextRecord} className="is-pulled-right"/>
        </div>
        <Menu label="record data" defaultOpen={false}>
          <div>
            <table className="table">
              <tbody>
              {
                Object.keys(store.activeData).map((column, ci) => {
                  const value = store.activeData[column];
                  return (
                    <tr key={ci}>
                      <td> {column} </td>
                      <td>
                        <Input value={value} />
                      </td>
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
          </div>
        </Menu>
        <Menu label="coordinates" defaultOpen={true}>
          <div>
            <Input value={store.recordX} />
            <Input value={store.recordY} />
          </div>
        </Menu>
        <br />

        <div className="block">
          <Button 
            label="restore changes" icon="refresh" 
            onClick={appStore.nextRecord} 
            className="is-danger" />
          <Button 
            label="save" icon="save" 
            onClick={appStore.nextRecord} 
            className="is-success is-pulled-right" 
          />
        </div>

      </div>
    )
  }
}