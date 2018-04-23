import React from 'react';
import { observer } from 'mobx-react';
import { Map, TileLayer } from 'react-leaflet';
import Button from './../bulma/button';
import Modal from './../bulma/modal';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    const opts = store.opts;
    this.state = {
      maxGeoExtent: opts.maxGeoExtent,
      columns: {
        name: opts.columns.name,
        x: opts.columns.x,
        y: opts.columns.y,
        note: opts.columns.note,
        placeName: opts.columns.placeName,
        certainty: opts.columns.certainty
      }
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

  renderColumnSelect(columnId, columnLabel) {
    return (
      <tr key={columnId}>
        {this._renderLabel(columnLabel)}
        <td className="control">
          <span style={this.styleSelect()} className="select">
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
          </span>
        </td>
      </tr>
    );
  }

  renderColumns() {
    return (
      <table className="table centered">
        <tbody>
          {this.renderColumnSelect('name', 'name column')}
          {this.renderColumnSelect('placeName', 'place name column')}
          {this.renderColumnSelect('x', 'x coordinate column')}
          {this.renderColumnSelect('y', 'y coordinate column')}
          {this.renderColumnSelect('certainty', 'certainty column')}
          {this.renderColumnSelect('note', 'localisation notes column')}
        </tbody>
      </table>
    );
  }

  renderExtent() {
    const extent = this.state.maxGeoExtent;
    const bounds = [[extent[0][0], extent[0][1]], [extent[1][0], extent[1][1]]];
    const basemap = store.basemapById('OSM');
    return (
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
    );
  }

  render() {
    return (
      <Modal
        style={this.style()}
        active={true}
        classes=""
        header={
          store.openedSettings === 'columns'
            ? 'Column settings'
            : 'Geo extent settings'
        }
        closeIcon={false}
        footer={
          <div className="container has-text-right">
            <Button
              classes="is-danger"
              icon="times-circle"
              label="close without save"
              onClick={this.handleClose.bind(this)}
            />
            <Button
              classes="is-success"
              icon="floppy-o"
              label="save and close"
              onClick={this.handleSave.bind(this)}
            />
          </div>
        }
        body={
          <div>
            {store.openedSettings === 'columns' && this.renderColumns()}
            {store.openedSettings === 'extent' && this.renderExtent()}
          </div>
        }
      />
    );
  }
}

export default observer(Settings);
