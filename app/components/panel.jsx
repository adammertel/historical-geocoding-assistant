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

  styleTag() {
    return {
      margin: '0px 5px',
      fontSize: 9
    }
  }

  styleSmallButton() {
    return {    
      marginTop: -3
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

  handleLocateGeocodedPlaceClick(geoname) {
    appStore.locateGeoname(geoname);
  }

  handleUseGeocodedPlaceClick(geoname) {
    appStore.useGeoname(geoname);
  }

  render() {
    //console.log(this.store.recordData)
    
    return (
      <div className="panel-wrapper" style={this.style()} >
        <div>
          <img 
            src="assets/icon.svg" 
            alt="logo"
            height="150px"
            width="300px" 
          />
        </div>
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
            <Input 
              type="float" 
              onChange={this.handleChangeInput.bind(this, appStore.columns.x)}
              value={this.store.recordX} 
            />
            <Input 
              type="float" 
              onChange={this.handleChangeInput.bind(this, appStore.columns.y)} 
              value={this.store.recordY} />
          </div>
        </Menu>

        <Menu label="geonames" defaultOpen={true}>
          <div> 
            {
              this.store.geonames.map( (geoname, gi) => {
                return (
                  <p key={gi}>
                    <Button 
                      tooltip="show on map"
                      icon="compass" label="" 
                      onClick={this.handleLocateGeocodedPlaceClick.bind(this, geoname)}
                      className="is-inverted hint--top-right" 
                      style={this.styleSmallButton()} 
                    />
                    <Button 
                      icon="floppy-o" label="" 
                      className="is-inverted" 
                      onClick={this.handleUseGeocodedPlaceClick.bind(this, geoname)}
                      style={this.styleSmallButton()} 
                    />
                    <span style={{marginLeft: 5}}>
                    {
                      geoname.toponymName 
                    }
                    </span>
                    <span className="tag is-dark" style={this.styleTag()}>
                    {
                      geoname.countryCode// + ' - ' + geoname.fcodeName
                    }
                    </span>
                  </p>
                )
              })
            }
          </div>
        </Menu>

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

        <div className="block">
          <Button 
            label="restore" icon="refresh" 
            onClick={this.store.nextRecord} 
            className="is-primary is-medium" />
          <Button 
            label="save" icon="save" 
            onClick={this.store.saveRecord} 
            className="is-primary  is-medium is-pulled-right" 
          />
        </div>

      </div>
    )
  }
}