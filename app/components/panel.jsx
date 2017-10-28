import React from 'react';
import { observer } from 'mobx-react';

import Menu from './../bulma/menu';
import Button from './../bulma/button';
import Checkbox from './../bulma/checkbox';
import Input from './../bulma/input';

class Panel extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      position: 'absolute',
      top: '0',
      right: '0',
      zIndex: 1000,
      width: '400px',
      backgroundColor: 'white',
      height: '100%',
      padding: 15,
      overflowY: 'scroll',
      overflowX: 'hidden',
      fontSize: 12
    };
  }

  styleTag() {
    return {
      margin: '0px 5px',
      fontSize: 9,
      verticalAlign: 'top'
    };
  }

  styleLabel() {
    return {
      marginLeft: '5px',
      overflow: 'hidden',
      width: '220px',
      display: 'inline-block',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
  }

  hiderStyle() {
    const opacity = store.changingLoadingStatus ? 0 : 0.5;
    return {
      backgroundColor: 'black',
      top: 0,
      height: 'inherit',
      right: 0,
      width: '400px',
      opacity: opacity,
      position: 'fixed',
      zIndex: 100
    };
  }

  styleSmallButton() {
    return {
      marginTop: -3
    };
  }

  handleChangeInput(column, e) {
    const value = e.target.value;
    store.updateRecordValue(column, value);
  }

  handleOpenWiki(url) {
    Base.openTab(url);
  }

  handleOpenGMaps() {
    Base.openTab('www.google.cz/maps/search/' + store.recordLocalisation);
  }

  handleOpenGSearch() {
    Base.openTab('www.google.com/search?q=' + store.recordName);
  }

  handleLocateGeocodedPlaceClick(geoname) {
    store.locateGeoname(geoname);
  }

  handleUseGeocodedPlaceClick(geoname) {
    store.useGeoname(geoname);
  }

  handleSelectRecord(e) {
    store.gotoRecord(e.target.value);
  }

  /* Coordinates actions */
  handleCoordinatesHighlight() {
    store.hlLocality(store.recordGeo);
  }
  handleCoordinatesFocus() {
    store.mapFocus(store.recordGeo);
  }
  handleCoordinatesRevert() {
    store.revertChangesCoordinates();
  }
  handleCoordinatesRemove() {
    store.removetChangesCoordinates();
  }
  handleRecordRevert() {
    store.revertChangesRecord();
  }

  handleGlobalSettingOpen() {
    store.openSettings();
  }
  handleChangeCertainty(e) {
    store.changeCertainty(e.target.value);
  }

  render() {
    return (
      <div className="panel-wrapper" style={this.style()}>
        {!store.isLoaded ? (
          <div
            className="panel-hider is-transition"
            style={this.hiderStyle()}
          />
        ) : null}
        <div>
          <img src="assets/icon.png" alt="logo" />
        </div>

        <div>
          <Button
            className="is-inverted is-medium"
            label="settings"
            icon="wrench"
            onClick={this.handleGlobalSettingOpen.bind(this)}
          />
          <div style={{ marginTop: 25 }} className="is-pulled-right">
            displaying record {store.recordRow - 1} / {store.noRecords - 1}
          </div>
        </div>

        <div className="is-inline">
          <Button
            className="is-inverted"
            label=""
            icon="caret-left"
            onClick={store.previousRecord}
          />

          <div className="select" style={{ width: '295px' }}>
            <select
              style={{ width: '100%' }}
              value={store.recordRow}
              onChange={this.handleSelectRecord.bind(this)}
            >
              {store.geoRecords.map(record => {
                if (Base.validGeo(record)) {
                  return (
                    <option key={record.row} value={record.row}>
                      {record.name}
                    </option>
                  );
                } else {
                  return (
                    <option key={record.row} value={record.row}>
                      {record.name} (no coordinates)
                    </option>
                  );
                }
              })}
            </select>
          </div>

          <Button
            label=""
            icon="caret-right"
            onClick={store.nextRecord}
            className="is-inverted is-pulled-right"
          />
          <div style={{ paddingTop: '20px', paddingLeft: '20px' }}>
            <Checkbox
              id="switch-otherrecords"
              label="display all records on map"
              classes="is-small"
              checked={store.config.displayOtherRecords}
              onChange={store.toggleDisplayOtherRecords.bind(store)}
            />
          </div>

          <div style={{ width: '100%', margin: 20 }}>
            <Button
              label="restore"
              icon="refresh"
              onClick={this.handleRecordRevert.bind(this)}
              className="is-danger is-small"
            />
            <span style={{ marginLeft: 5 }} />
            <Button
              label="save"
              icon="save"
              onClick={store.saveRecord}
              className="is-success is-small "
            />
          </div>
        </div>

        <Menu
          label="coordinates"
          defaultOpen={true}
          icon="map-marker"
          iconColor="#A64005"
        >
          <div>
            {!Base.inExtent(
              [store.recordY, store.recordX],
              store.config.maxGeoExtent
            ) ? (
                <div className="is-danger notification">
                  <i className="icon fa fa-exclamation" />The coordinates are
                outside of the chosen geographical extent
                </div>
              ) : null}
            <table
              className="table"
              style={{ fontSize: 12, marginBottom: '0.5rem' }}
            >
              <tbody>
                <tr key="0">
                  <td style={{ textAlign: 'right' }}>coordinate X</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.config.columns.x
                      )}
                      type="number"
                      value={store.recordX}
                    />
                  </td>
                </tr>

                <tr key="1">
                  <td style={{ textAlign: 'right' }}>coordinate Y</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.config.columns.y
                      )}
                      type="number"
                      value={store.recordY}
                    />
                  </td>
                </tr>

                <tr key="2">
                  <td style={{ textAlign: 'right' }}>localisation</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.config.columns.localisation
                      )}
                      value={store.recordLocalisation}
                    />
                  </td>
                </tr>

                <tr key="3">
                  <td style={{ textAlign: 'right' }}>notes</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.config.columns.note
                      )}
                      value={store.recordNote}
                    />
                  </td>
                </tr>

                <tr key="4">
                  <td style={{ textAlign: 'right' }}>certainty level</td>
                  <td>
                    <div className="select" style={{ width: '100%' }}>
                      <select
                        style={{ fontSize: '11px', width: '100%' }}
                        value={store.recordCertainty}
                        onChange={this.handleChangeCertainty.bind(this)}
                      >
                        {Object.keys(config.certaintyOptions).map(cKey => {
                          const value = config.certaintyOptions[cKey];
                          return (
                            <option key={cKey} value={cKey}>
                              {value}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div>
              {Base.validGeo({
                x: store.recordX,
                y: store.recordY
              }) ? (
                  <div>
                    <Button
                      onClick={this.handleCoordinatesHighlight.bind(this)}
                      tooltip="highlight location on map"
                      icon="lightbulb-o"
                      label="highlight"
                      className="is-inverted hint--top-right"
                      style={this.styleSmallButton()}
                    />
                    <Button
                      onClick={this.handleCoordinatesFocus.bind(this)}
                      tooltip="pan map to the location"
                      icon="compass"
                      label="focus"
                      className="is-inverted hint--top-right"
                      style={this.styleSmallButton()}
                    />
                    <Button
                      onClick={this.handleCoordinatesRevert.bind(this)}
                      tooltip="revert changes to record coordinates"
                      icon="recycle"
                      label="revert"
                      className="is-inverted hint--top-right"
                      style={this.styleSmallButton()}
                    />
                    <Button
                      onClick={this.handleCoordinatesRemove.bind(this)}
                      tooltip="truncate coordinates"
                      icon="trash"
                      label="remove"
                      className="is-inverted hint--top-right"
                      style={this.styleSmallButton()}
                    />
                  </div>
                ) : null}
            </div>
          </div>
        </Menu>

        <Menu label="record data" defaultOpen={false}>
          <div>
            <table className="table" style={{ fontSize: 12 }}>
              <tbody>
                {Object.keys(store.recordData).map((column, ci) => {
                  const value = store.recordData[column];

                  const shortenColumn =
                    column.length > 15 ? column.substr(0, 14) + '...' : column;

                  return (
                    <tr key={ci}>
                      <td> {shortenColumn} </td>
                      <td>
                        <Input
                          info={true}
                          value={value}
                          onChange={this.handleChangeInput.bind(this, column)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Menu>

        <Menu
          label="geonames"
          defaultOpen={true}
          icon="map-marker"
          iconColor="#D9AE5F"
        >
          <div>
            <Checkbox
              id="switch-geonames"
              label="display places geonames on map"
              classes="is-small"
              checked={store.config.displayGeonames}
              onChange={store.toggleDisplayGeonames.bind(store)}
            />
            {store.geonames.filter(g => g).map((geoname, gi) => {
              return (
                <div key={gi}>
                  <Button
                    tooltip="show on map"
                    icon="compass"
                    label=""
                    onClick={this.handleLocateGeocodedPlaceClick.bind(
                      this,
                      geoname
                    )}
                    className="is-inverted hint--top-right"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    icon="floppy-o"
                    label=""
                    className="is-inverted"
                    onClick={this.handleUseGeocodedPlaceClick.bind(
                      this,
                      geoname
                    )}
                    style={this.styleSmallButton()}
                  />
                  <span
                    className="tag is-dark tooltip"
                    data-tooltip={geoname.countryName}
                    style={this.styleTag()}
                  >
                    {
                      geoname.countryCode // + ' - ' + geoname.fcodeName
                    }
                  </span>
                  <div style={this.styleLabel()}>{geoname.name || ''}</div>
                </div>
              );
            })}
          </div>
        </Menu>

        <Menu
          label="wikipedia"
          defaultOpen={true}
          icon="map-marker"
          iconColor="#5f8ad9"
        >
          <Checkbox
            id="switch-wikipedia"
            label="display wikipedia places on map"
            classes="is-small"
            checked={store.config.displayWikis}
            onChange={store.toggleDisplayWikis.bind(store)}
          />
          <div>
            {store.wikis.map((wiki, wi) => {
              return (
                <p key={wi}>
                  <Button
                    tooltip="show on map"
                    icon="compass"
                    label=""
                    onClick={this.handleLocateGeocodedPlaceClick.bind(
                      this,
                      wiki
                    )}
                    className="is-inverted hint--top-right"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    icon="floppy-o"
                    label=""
                    className="is-inverted"
                    onClick={this.handleUseGeocodedPlaceClick.bind(this, wiki)}
                    style={this.styleSmallButton()}
                  />
                  <Button
                    icon="wikipedia-w"
                    label=""
                    className="is-inverted"
                    onClick={this.handleOpenWiki.bind(this, wiki.wikipediaUrl)}
                    style={this.styleSmallButton()}
                  />
                  <span
                    className="tooltip is-tooltip-multiline"
                    data-tooltip={wiki.summary}
                    style={this.styleLabel()}
                  >
                    {wiki.title || ''}
                  </span>
                </p>
              );
            })}
          </div>
        </Menu>
        <Menu label="google" defaultOpen={true}>
          <div>
            <Button
              label="open google search"
              icon="google"
              className="is-inverted"
              onClick={this.handleOpenGSearch.bind(this)}
            />
          </div>
          <div>
            <Button
              label="open google maps"
              icon="map"
              className="is-inverted"
              onClick={this.handleOpenGMaps.bind(this)}
            />
          </div>
        </Menu>

        <div
          className="block is-pulled-right"
          style={{ float: 'right', padding: 5, margin: 10 }}
        >
          <Button
            label="restore"
            icon="refresh"
            onClick={this.handleRecordRevert.bind(this)}
            className="is-danger is-small"
          />
          <span style={{ marginLeft: 5 }} />
          <Button
            label="save"
            icon="save"
            onClick={store.saveRecord}
            className="is-success is-small "
          />
        </div>
      </div>
    );
  }
}

export default observer(Panel);
