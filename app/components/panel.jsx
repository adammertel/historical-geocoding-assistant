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
      fontSize: 8.5,
      verticalAlign: 'top',
      padding: '4px',
      border: '1px solid black',
      marginRight: 0,
      cursor: 'default'
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
    Base.openTab('www.google.cz/maps/search/' + store.recordPlaceName);
  }

  handleOpenGSearch() {
    Base.openTab('www.google.com/search?q=' + store.recordName);
  }
  handleOpenPeripleo() {
    Base.openTab('www.peripleo.pelagios.org/ui#q=' + store.recordName);
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
    store.removeChangesCoordinates();
  }
  handleRecordRevert() {
    store.revertChangesRecord();
  }

  handleGlobalSettingOpen(mode) {
    store.openSettings(mode);
  }
  handleChangeCertainty(e) {
    store.changeCertainty(e.target.value);
  }

  render() {
    return (
      <div className="panel-wrapper" style={this.style()}>
        <div id="version">{'version ' + window['version']}</div>
        <div>
          <img src="app/assets/icon.png" alt="logo" style={{ padding: 20 }} />
        </div>

        <div style={{ marginRight: 30, textAlign: 'right' }}>
          record {store.row - 1} / {store.noRecords - 1}
        </div>
        <div className="is-inline">
          <Button
            classes="is-inverted"
            label=""
            icon="caret-left"
            onClick={store.previousRecord}
          />

          <div className="select" style={{ width: 300 }}>
            <select
              style={{ width: '100%' }}
              value={store.row}
              onChange={this.handleSelectRecord.bind(this)}
            >
              {store.geoRecords.map(record => {
                if (Base.validGeo([record['x'], record['y']])) {
                  return (
                    <option key={record.row} value={record.row}>
                      {record.name}
                    </option>
                  );
                } else {
                  return (
                    <option key={record.row} value={record.row}>
                      {record.name + '(no coordinates)'}
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
            classes="is-inverted is-pulled-right"
          />
        </div>

        <div
          style={{
            width: '100%',
            paddingRight: 10,
            textAlign: 'right',
            marginTop: 10,
            marginBottom: 10
          }}
          className="button-row"
        >
          <Button
            label="restore"
            icon="refresh"
            onClick={this.handleRecordRevert.bind(this)}
            classes="is-danger is-small"
          />
          <Button
            label="save"
            icon="save"
            onClick={store.saveRecord}
            classes="is-success is-small "
          />
        </div>

        <Menu
          label="localisation"
          defaultOpen={true}
          icon="map-marker"
          iconColor="#A64005"
        >
          <div>
            {!Base.inExtent(
              [store.recordY, store.recordX],
              store.opts.maxGeoExtent
            ) ? (
              <div className="is-danger notification">
                <i className="icon fa fa-exclamation" />The coordinates are
                outside of the chosen geographical extent
              </div>
            ) : null}
            <table className="table centered">
              <tbody>
                <tr key="0">
                  <td>coordinate X</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.opts.columns.x
                      )}
                      type="number"
                      value={store.recordX}
                    />
                  </td>
                </tr>

                <tr key="1">
                  <td>coordinate Y</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.opts.columns.y
                      )}
                      type="number"
                      value={store.recordY}
                    />
                  </td>
                </tr>

                <tr key="2">
                  <td>place name</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.opts.columns.placeName
                      )}
                      value={store.recordPlaceName}
                    />
                  </td>
                </tr>

                <tr key="3">
                  <td>notes</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.opts.columns.note
                      )}
                      value={store.recordNote}
                    />
                  </td>
                </tr>

                <tr key="4">
                  <td>certainty level</td>
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
              {Base.validGeo([store.recordX, store.recordY]) ? (
                <div className="button-row">
                  <Button
                    onClick={this.handleCoordinatesHighlight.bind(this)}
                    tooltip="highlight location on map"
                    icon="lightbulb-o"
                    label="highlight"
                    classes="is-inverted hint--top-right"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    onClick={this.handleCoordinatesFocus.bind(this)}
                    tooltip="pan map to the location"
                    icon="compass"
                    label="focus"
                    classes="is-inverted hint--top-right"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    onClick={this.handleCoordinatesRevert.bind(this)}
                    tooltip="revert changes to record coordinates"
                    icon="recycle"
                    label="revert"
                    classes="is-inverted hint--top-right"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    onClick={this.handleCoordinatesRemove.bind(this)}
                    tooltip="truncate coordinates"
                    icon="trash"
                    label="remove"
                    classes="is-inverted hint--top-right"
                    style={this.styleSmallButton()}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </Menu>

        <Menu label="record data" defaultOpen={false}>
          <div>
            <table className="table centered">
              <tbody>
                {Object.keys(store.recordData).map((column, ci) => {
                  const value = store.recordData[column];

                  const shortenColumn =
                    column.length > 13 ? column.substr(0, 12) + '...' : column;

                  return (
                    <tr key={ci}>
                      <td title={column}> {shortenColumn} </td>
                      <td>
                        <Input
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
          label={'geonames (' + store.geonames.length + ' found)'}
          defaultOpen={true}
          icon="map-marker"
          iconColor="#5fd9ae"
        >
          <div>
            <Checkbox
              id="switch-geonames"
              label="display on map"
              classes="is-small"
              checked={store.opts.displayGeonames}
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
                    classes="is-inverted hint--top-right"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    icon="floppy-o"
                    label=""
                    classes="is-inverted"
                    onClick={this.handleUseGeocodedPlaceClick.bind(
                      this,
                      geoname
                    )}
                    style={this.styleSmallButton()}
                  />
                  <span
                    className="tag is-white tooltip"
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
          label={'wikipedia (' + store.wikis.length + ' found)'}
          defaultOpen={true}
          icon="map-marker"
          iconColor="#5f8ad9"
        >
          <Checkbox
            id="switch-wikipedia"
            label="display places on map"
            classes="is-small"
            checked={store.opts.displayWikis}
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
                    classes="is-inverted hint--top-right"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    icon="floppy-o"
                    label=""
                    classes="is-inverted"
                    onClick={this.handleUseGeocodedPlaceClick.bind(this, wiki)}
                    style={this.styleSmallButton()}
                  />
                  <Button
                    icon="wikipedia-w"
                    label=""
                    classes="is-inverted"
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
              classes="is-inverted"
              onClick={this.handleOpenGSearch.bind(this)}
            />
          </div>
          <div>
            <Button
              label="open google maps"
              icon="map"
              classes="is-inverted"
              onClick={this.handleOpenGMaps.bind(this)}
            />
          </div>
          <div>
            <Button
              label="open peripleo"
              icon="map-signs"
              classes="is-inverted"
              onClick={this.handleOpenPeripleo.bind(this)}
            />
          </div>
        </Menu>

        <Menu
          label="settings"
          defaultOpen={true}
          icon="wrench"
          iconColor="#A64005"
        >
          <div>
            <div className="checkboxes-line">
              <Checkbox
                id="switch-otherrecords"
                label="display all records on map ("
                classes="is-small"
                checked={store.opts.displayOtherRecords}
                onChange={store.toggleDisplayOtherRecords.bind(store)}
              />
              <Checkbox
                id="switch-clusters"
                label="clusters )"
                classes="is-small"
                checked={store.opts.mapClusters}
                onChange={store.toggleMapClusters.bind(store)}
              />
            </div>
            <div className="checkboxes-line">
              <Checkbox
                id="switch-focus-onchange"
                label="focus map on record change ("
                classes="is-small"
                checked={store.opts.focusOnRecordChange}
                onChange={store.toggleFocusChange.bind(store)}
              />
              <div style={{}} className="field">
                <div style={{}} className="select">
                  <select
                    value={store.opts.focusZoom}
                    onChange={store.handleChangeSelect.bind(store)}
                  >
                    {[8, 9, 10, 11, 12, 13, 14, 15].map((option, oi) => {
                      return (
                        <option key={oi} value={option}>
                          {option}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <label> zoom level)</label>
              </div>
            </div>
            <div className="button-row">
              <Button
                classes=""
                label="columns"
                icon="columns"
                onClick={this.handleGlobalSettingOpen.bind(this, 'columns')}
              />
              <Button
                classes=""
                label="geo extent"
                icon="globe"
                onClick={this.handleGlobalSettingOpen.bind(this, 'extent')}
              />
            </div>
          </div>
        </Menu>
      </div>
    );
  }
}

export default observer(Panel);
