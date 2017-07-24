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
    this.store = appStore;
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
      padding: 15,
      overflowY: 'scroll',
      fontSize: 12
    }
  }

  handleChangeInput(column, e) {
    const value = e.target.value;
    this.store.updateRecordValue(column, value);
  }

  handleOpenWiki() {
    window.open(
      'https://en.wikipedia.org/w/index.php?action=parse&search=' + this.store.recordName,
      '_blank',
      'width=600,height=900'
    );
  }

  render() {
    //console.log(this.store.recordData)
    
    return (
      <div className="panel-wrapper" style={this.style()} >
        <div className="is-inline">
          <Button label="" icon="caret-left" onClick={this.store.previousRecord} />
          <h4 className="title is-4 is-inline has-text-centered" style={{margin: 5, fontWeight: 600}}>
            {this.store.recordName}
          </h4>
          <Button label="" icon="caret-right" onClick={this.store.nextRecord} className="is-pulled-right"/>
        </div>
        <Menu label="record data" defaultOpen={true}>
          <div>
            <table className="table" style={{fontSize: 11}}>
              <tbody>
              {
                Object.keys(this.store.recordData).map((column, ci) => {
                  const value = this.store.recordData[column];
                  return (
                    <tr key={ci}>
                      <td> {column} </td>
                      <td>
                        <Input value={value} onChange={this.handleChangeInput.bind(this, column)} />
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
            <Input value={this.store.recordX} />
            <Input value={this.store.recordY} />
          </div>
        </Menu>
        <br />

        <Menu label="wikipedia" defaultOpen={true}>
          <div>
            <div 
              style={{fontSize: 8.5}}
              className="notification" 
              dangerouslySetInnerHTML={{
                __html:this.store.wikiTextShort
              }} 
            />
            <Button label="open new tab" icon="wikipedia-w" onClick={this.handleOpenWiki.bind(this)}/>
          </div>
        </Menu>
        <br />

        <div className="block">
          <Button 
            label="restore changes" icon="refresh" 
            onClick={this.store.nextRecord} 
            className="is-danger" />
          <Button 
            label="save" icon="save" 
            onClick={this.store.saveRecord} 
            className="is-success is-pulled-right" 
          />
        </div>

      </div>
    )
  }
}