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
      overflowX: 'hidden',
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

  handleSelectRecord(e) {
    appStore.gotoRecord(e.target.value);
  }

  /* Coordinates actions */
  handleCoordinatesHighlight() {
    appStore.hlLocality(appStore.recordGeo);
  }
  handleCoordinatesFocus() {
    appStore.mapFocus(appStore.recordGeo);
  }
  handleCoordinatesRevert() {
    appStore.revertChangesCoordinates();
  }
  handleCoordinatesRemove() {
    appStore.removetChangesCoordinates();
  }
  handleRecordRevert() {
    appStore.revertChangesRecord();
  }

  handleGlobalSettingOpen() {
    appStore.openSettings();
  }

  render() {
    //console.log(this.store.recordData)
    
    return (
      <div className="panel-wrapper" style={this.style()} >
        
        <div>
          <img  
            src="assets/icon.png" 
            alt="logo"
          />
        </div>

        <div>
          <Button 
            className="is-inverted is-medium" 
            label="settings" 
            icon="wrench" 
            onClick={this.handleGlobalSettingOpen.bind(this)} 
          />
          <div style={{marginTop: 25}} className="is-pulled-right">
            displaying record {appStore.recordRow - 1} / {appStore.noRecords - 1}
          </div>
        </div>

        <div className="is-inline">
          <Button 
            className="is-inverted" 
            label="" 
            icon="caret-left" 
            onClick={this.store.previousRecord} 
          />

          <div className="select" style={{width: 300}}>
            <select style={{width: '100%'}} value={appStore.recordRow} onChange={this.handleSelectRecord.bind(this)}>
              {
                appStore.geoRecords.map( record => {
                  console.log();

                  if (Base.validGeo(record)) {
                    return (
                      <option key={record.row} value={record.row}>
                        {record.name}
                      </option>
                    )
                  } else {
                    return (
                      <option key={record.row} value={record.row}>
                        {record.name} (no coordinates)
                      </option>
                    )
                  }
                })
              }
            </select>
          </div>

          <Button label="" icon="caret-right" onClick={this.store.nextRecord} className="is-inverted is-pulled-right"/>
        </div>

        <Menu label="coordinates" defaultOpen={true}>
          <div>
            <Input 
              type="float" 
              onChange={this.handleChangeInput.bind(this, appStore.config.columns.x)}
              value={this.store.recordX} 
            />
            <Input 
              type="float" 
              onChange={this.handleChangeInput.bind(this, appStore.config.columns.y)} 
              value={this.store.recordY} 
            />
            {
              !Base.inExtent(
                [this.store.recordY, this.store.recordX],
                this.store.config.maxGeoExtent
              ) ? 
              (
                <div className="is-danger notification">
                  <i className="icon fa fa-exclamation"></i>The coordinates are outside of the chosen geographical extent
                </div>
              ) : null
            }
            <span>Localisation: <strong>{this.store.recordLocalisation}</strong></span>
            <div>
              {
                Base.validGeo({x: this.store.recordX, y: this.store.recordY}) ? (
                  <div>
                    <Button 
                      onClick={this.handleCoordinatesHighlight.bind(this)}
                      tooltip="highlight location on map"
                      icon="lightbulb-o" label="highlight"
                      className="is-inverted hint--top-right" 
                      style={this.styleSmallButton()} 
                    />
                    <Button 
                      onClick={this.handleCoordinatesFocus.bind(this)}
                      tooltip="pan map to the location"
                      icon="compass" label="focus"
                      className="is-inverted hint--top-right" 
                      style={this.styleSmallButton()} 
                    />
                    <Button 
                      onClick={this.handleCoordinatesRevert.bind(this)}
                      tooltip="revert changes to record coordinates"
                      icon="recycle" label="revert"
                      className="is-inverted hint--top-right"
                      style={this.styleSmallButton()}
                    />
                    <Button 
                      onClick={this.handleCoordinatesRemove.bind(this)}
                      tooltip="truncate coordinates"
                      icon="trash" label="remove"
                      className="is-inverted hint--top-right"
                      style={this.styleSmallButton()}
                    />
                  </div>
                ) : null
              }
            </div>
          </div>
        </Menu>

        <Menu label="record data" defaultOpen={false}>
          <div>
            <table className="table" style={{fontSize: 11}}>
              <tbody>
              {
                Object.keys(this.store.recordData).map((column, ci) => {
                  const value = this.store.recordData[column];

                  const shortenColumn = column.length > 15 ?
                    column.substr(0, 14) + '...' : column;

                  return (
                    <tr key={ci}>
                      <td> {shortenColumn} </td>
                      <td>
                        <Input info={true} value={value} onChange={this.handleChangeInput.bind(this, column)} />
                      </td>
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
          </div>
        </Menu>

        <Menu label="geonames" defaultOpen={true}>
          <div> 
            {
              this.store.geonames.filter(g => g).map( (geoname, gi) => {
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
                      geoname.toponymName || ''
                    }
                    </span>
                    <span className="tag is-dark" style={this.styleTag()}>
                    {
                      geoname.countryCode // + ' - ' + geoname.fcodeName
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
            <Button label="open new tab" icon="wikipedia-w" className="is-inverted" 
              onClick={this.handleOpenWiki.bind(this)}/>
          </div>
        </Menu>

        <div className="block is-pulled-right" style={{float: 'right', padding: 5, margin: 10}}>
          <Button 
            label="restore" icon="refresh" 
            onClick={this.handleRecordRevert.bind(this)} 
            className="is-danger is-small" 
          />
          <span style={{marginLeft: 5}} />
          <Button 
            label="save" icon="save" 
            onClick={this.store.saveRecord} 
            className="is-success is-small " 
          />
        </div>

      </div>
    )
  }
}