import React from 'react';
import { observer } from 'mobx-react';
import { Map, TileLayer } from 'react-leaflet';
import Button from './../bulma/button';
import Modal from './../bulma/modal';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    const config = store.config;
    this.state = {
      focusZoom: config.focusZoom,
      maxGeoExtent: config.maxGeoExtent,
      maxResults: config.maxResults,
      columns: {
        name: config.columns.name,
        x: config.columns.x,
        y: config.columns.y,
        note: config.columns.note,
        localisation: config.columns.localisation,
        certainty: config.columns.certainty
      }
    };

    this.options = {
      maxResults: [1, 3, 5, 10, 15, 20],
      focusZoom: [8, 9, 10, 11, 12, 13, 14, 15]
    };
  }

  style() {
    return {
      zIndex: 10000
    };
  }

  mapStyle() {
    return {
      width: '100%',
      height: '100%'
    };
  }

  styleLabel() {
    return {
      fontSize: 12
    };
  }

  styleSelect() {
    return {
      fontSize: 12
    };
  }

  handleSave() {
    store.saveSettings(this.state);
    store.closeSettings();
  }

  handleClose() {
    store.closeSettings();
  }

  handleGeoExtentChange() {
    if (this.refs.refMap) {
      const bounds = this.refs.refMap.leafletElement.getBounds();

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      this.setState({
        maxGeoExtent: [[sw.lat, sw.lng], [ne.lat, ne.lng]]
      });
    }
  }

  handleChangeSelect(propName, e) {
    const newState = {};
    newState[propName] = parseInt(e.target.value, 10);
    this.setState(newState);
  }

  handleChangeColumn(columnName, e) {
    const newState = Object.assign(this.state, {});
    newState.columns[columnName] = e.target.value;
    this.setState(newState);
  }

  _renderLabel(label) {
    return (
      <td key="label" style={{ width: 250, paddingTop: 12 }}>
        <label style={this.styleLabel()} className="label">
          {label}
        </label>
      </td>
    );
  }

  renderSelect(propName, propLabel) {
    console.log(propName);
    return (
      <tr key={propName}>
        {this._renderLabel(propLabel)}
        <td className="control">
          <div style={this.styleSelect()} className="select">
            <select
              value={this.state[propName]}
              onChange={this.handleChangeSelect.bind(this, propName)}
            >
              {this.options[propName].map((option, oi) => {
                return (
                  <option key={oi} value={option}>
                    {option}
                  </option>
                );
              })}
            </select>
          </div>
        </td>
      </tr>
    );
  }

  renderColumnSelect(columnId, columnLabel) {
    return (
      <tr key={columnId}>
        {this._renderLabel(columnLabel)}
        <td className="control">
          <div style={this.styleSelect()} className="select">
            <select
              value={this.state.columns[columnId]}
              onChange={this.handleChangeColumn.bind(this, columnId)}
            >
              {Object.keys(store.recordData).map((column, ci) => {
                return (
                  <option key={ci} value={column}>
                    {column}
                  </option>
                );
              })}
            </select>
          </div>
        </td>
      </tr>
    );
  }

  render() {
    const extent = this.state.maxGeoExtent;
    const bounds = [[extent[0][0], extent[0][1]], [extent[1][0], extent[1][1]]];

    const basemap = store.basemapById('OSM');

    return (
      <Modal
        style={this.style()}
        active={true}
        classes=""
        header="Global Settings"
        closeIcon={false}
        footer={
          <div className="container has-text-right">
            <Button
              className="is-danger"
              icon="times-circle"
              label="close without save"
              onClick={this.handleClose.bind(this)}
            />
            <Button
              className="is-success"
              icon="floppy-o"
              label="save and close"
              onClick={this.handleSave.bind(this)}
            />
          </div>
        }
        body={
          <table className="table centered">
            <tbody>
              {this.renderSelect(
                'maxResults',
                'max results of search (geonames, wikipedia)'
              )}
              {this.renderSelect('focusZoom', 'level of zoom on focus')}

              <tr>{this._renderLabel('')}</tr>

              {this.renderColumnSelect('name', 'name column')}
              {this.renderColumnSelect('localisation', 'localisation column')}
              {this.renderColumnSelect('x', 'x coordinate column')}
              {this.renderColumnSelect('y', 'y coordinate column')}
              {this.renderColumnSelect('certainty', 'certainty column')}
              {this.renderColumnSelect('note', 'localisation notes column')}

              <tr>{this._renderLabel('')}</tr>
              <tr>
                {this._renderLabel('geographical extent')}
                <td>
                  <Map
                    zoomControl={false}
                    zoomSnap={0.1}
                    zoomDelta={0.05}
                    ref="refMap"
                    bounds={bounds}
                    onViewportChanged={this.handleGeoExtentChange.bind(this)}
                    style={{ width: '100%', height: 200 }}
                  >
                    <TileLayer {...basemap} />
                  </Map>
                </td>
              </tr>
            </tbody>
          </table>
        }
      />
    );
  }
}

export default observer(Settings);
