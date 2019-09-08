import React from "react";
import { observer } from "mobx-react";
import { Map, TileLayer, Rectangle, Marker } from "react-leaflet";
import Button from "./../bulma/button";
import Modal from "./../bulma/modal";

class Settings extends React.Component {
  constructor(props) {
    super(props);
    const opts = store.opts;

    this.cornerIcon = Base.icon(
      "fa fa-circle",
      "color: black",
      [12, 12],
      [12, 12]
    );
    this.centerIcon = Base.icon(
      "fa fa-arrows",
      "color: black",
      [12, 12],
      [12, 12]
    );
    const lls = store.configMaxGeoExtent;
    const ll1 = L.latLng(lls[0][0], lls[0][1]);
    const ll2 = L.latLng(lls[1][0], lls[1][1]);
    const extent = new L.latLngBounds(ll1, ll2);

    this.state = {
      mapBounds: [[-90, -180], [90, 180]],
      maxGeoExtent: extent,
      extentCorner1: ll1,
      extentCorner2: ll2,
      draggingCenter: false,
      draggingCenterOrigin: false,
      columns: {
        name: opts.columns.name,
        x: opts.columns.x,
        y: opts.columns.y,
        note: opts.columns.note,
        certainty: opts.columns.certainty
      }
    };
  }

  componentDidMount() {
    this.afterRender();
  }
  componentDidUpdate() {
    this.afterRender();
  }

  afterRender() {
    console.log("after render");
  }

  style() {
    return {
      zIndex: 10000
    };
  }

  mapStyle() {
    return {
      width: "100%",
      height: "100%"
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
    const extent = new L.latLngBounds(
      this.state.extentCorner1,
      this.state.extentCorner2
    );

    const stateObj = Object.assign(this.state, {});
    stateObj.maxGeoExtent = [
      [extent.getSouth(), extent.getWest()],
      [extent.getNorth(), extent.getEast()]
    ];

    store.saveSettings(stateObj);
    store.closeSettings();
  }

  handleClose() {
    store.closeSettings();
  }

  handleMapViewport() {
    if (this.refs.refMap) {
      const bounds = this.refs.refMap.leafletElement.getBounds();

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      this.setState({
        mapBounds: [[sw.lat, sw.lng], [ne.lat, ne.lng]]
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

  handleDragRectangleStart(e) {
    console.log("dragging start");
  }
  handleDragRectangleEnd(e) {
    this.lastCenterOrigin = false;
  }
  handleDragRectangle(e) {
    const ll = e.latlng;

    if (this.lastCenterOrigin) {
      const oll = this.lastCenterOrigin;
      const lat = ll.lat - oll.lat;
      const lng = ll.lng - oll.lng;

      const marker1 = this.refs.marker1.leafletElement;
      const marker2 = this.refs.marker2.leafletElement;
      const ll1 = marker1.getLatLng();
      const ll2 = marker2.getLatLng();

      ll1.lat += lat;
      ll2.lat += lat;
      ll1.lng += lng;
      ll2.lng += lng;

      this.setState({
        extentCorner1: ll1,
        extentCorner2: ll2
      });
    }

    this.lastCenterOrigin = ll;
  }
  handleDragBound() {
    console.log("dragging");
    if (this.refs.marker1 && this.refs.marker2) {
      const marker1 = this.refs.marker1.leafletElement;
      const marker2 = this.refs.marker2.leafletElement;
      const ll1 = marker1.getLatLng();
      const ll2 = marker2.getLatLng();

      this.setState({
        extentCorner1: ll1,
        extentCorner2: ll2
      });
    }
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
      <div>
        <div className="subtitle is-6">
          Select which column contain which type of information
        </div>
        <table className="table centered">
          <tbody>
            {this.renderColumnSelect("name", "place name column")}
            {this.renderColumnSelect("x", "x coordinate column")}
            {this.renderColumnSelect("y", "y coordinate column")}
            {this.renderColumnSelect("certainty", "certainty column")}
            {this.renderColumnSelect("note", "localisation notes column")}
          </tbody>
        </table>
      </div>
    );
  }

  renderExtent() {
    const extent = L.latLngBounds(
      this.state.extentCorner1,
      this.state.extentCorner2
    );

    const basemap = store.basemapById("OSM");

    return (
      <Map
        zoomControl={true}
        zoomSnap={0.05}
        zoomDelta={0.05}
        ref="refMap"
        bounds={this.state.mapBounds}
        onViewportChanged={this.handleMapViewport.bind(this)}
        style={{ width: "100%", height: 400 }}
      >
        <Marker
          key={"corner1"}
          position={[
            this.state.extentCorner1.lat,
            this.state.extentCorner1.lng
          ]}
          onDrag={this.handleDragBound.bind(this)}
          draggable={true}
          ref="marker1"
          icon={this.cornerIcon}
        />
        <Marker
          key={"corner2"}
          position={[
            this.state.extentCorner2.lat,
            this.state.extentCorner2.lng
          ]}
          onDrag={this.handleDragBound.bind(this)}
          draggable={true}
          ref="marker2"
          icon={this.cornerIcon}
        />
        <Marker
          key={"corner-center"}
          position={extent.getCenter()}
          onDrag={this.handleDragRectangle.bind(this)}
          onDragEnd={this.handleDragRectangleEnd.bind(this)}
          onDragStart={this.handleDragRectangleStart.bind(this)}
          draggable={true}
          ref="marker-center"
          icon={this.centerIcon}
        />
        <Rectangle bounds={extent} />
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
          store.openedSettings === "columns"
            ? "Column settings"
            : "Geo extent settings"
        }
        closeIcon={false}
        footer={
          <div className="container has-text-right">
            <Button
              classes="is-danger"
              icon="times-circle"
              label="close without saving"
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
            {store.openedSettings === "columns" && this.renderColumns()}
            {store.openedSettings === "extent" && this.renderExtent()}
          </div>
        }
      />
    );
  }
}

export default observer(Settings);
