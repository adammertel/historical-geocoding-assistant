import React from 'react';
import {
  Map,
  TileLayer,
  WMSTileLayer,
  ScaleControl,
  AttributionControl,
  CircleMarker,
  Tooltip,
  Marker,
  LayerGroup,
  GeoJSON,
  Pane
} from 'react-leaflet';

import { divIcon } from 'leaflet';
import { observer } from 'mobx-react';
import MarkerClusterGroup from 'react-leaflet-markercluster';
require('leaflet.markercluster.placementstrategies');

class AppMap extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {};
  }

  componentDidMount() {
    window['map'] = this.refs.map.leafletElement;
  }

  mapStyle() {
    return {
      position: 'absolute',
      left: '0',
      right: '400px',
      height: '100%'
    };
  }

  handleClickMarker(rowId) {
    store.gotoRecord(rowId);
  }

  handleClickGeoname(geoname, e) {
    store.useGeoname(geoname);
    console.log(e);
    console.log(e.target);
    map.closeTooltip(e.target._tooltip);
  }

  handleMapClick(e) {
    store.updateRecordLocation(e.latlng.lng, e.latlng.lat);
  }

  renderBaseLayer(top) {
    const basemap = top ? store.basemap1 : store.basemap2;
    const opacity = top ? 1 - store.mapOpacityRatio : store.mapOpacityRatio;

    if (basemap.type === 'tile') {
      return <TileLayer key={top ? '1' : '2'} opacity={opacity} {...basemap} />;
    } else if (basemap.type === 'wms') {
      return (
        <WMSTileLayer key={top ? '1' : '2'} opacity={opacity} {...basemap} />
      );
    }
  }

  renderBaseLayers() {
    return (
      <LayerGroup>
        {this.renderBaseLayer(false)}
        {this.renderBaseLayer(true)}
      </LayerGroup>
    );
  }

  renderOverlays() {
    return (
      <div>
        {store.overlays.map((o, oid) => {
          const overlay = overlaymaps[o.id];
          const zIndex = 400 - oid;

          if (overlay.type === 'wms') {
            return (
              <WMSTileLayer
                key={o.id}
                zIndex={zIndex}
                {...overlay}
                opacity={o.opacity}
              />
            );
          } else if (overlay.type === 'geojson') {
            return (
              <Pane style={{ zIndex: zIndex }} key={o.id} name={overlay.id}>
                <GeoJSON
                  {...overlay}
                  opacity={o.opacity * overlay.opacity || o.opacity}
                  fillOpacity={o.opacity * overlay.fillOpacity || o.opacity}
                />
              </Pane>
            );
          }
        })}
      </div>
    );
  }

  icon(classes, style, size) {
    return divIcon({
      html:
        '<span style="' +
        style +
        '; vertical-align: bottom"' +
        ' class="icon"><i class="' +
        classes +
        '"></i></span>',
      className: 'map-sort-icon',
      iconAnchor: [size[0] / 2, size[1]],
      iconSize: size
    });
  }

  renderOtherRecords() {
    const records = store.geoRecords
      .filter(Base.validGeo)
      .filter(r => !Base.same(r.row, store.recordRow))
      .map((record, ri) => {
        return (
          <Marker
            key={ri}
            position={[parseFloat(record.y), parseFloat(record.x)]}
            icon={this.icon('fa fa-map-marker', 'color: black', [20, 20])}
            onClick={this.handleClickMarker.bind(this, record.row)}
          >
            <Tooltip offset={[10, -10]} direction="right">
              <h4>{record.name}</h4>
            </Tooltip>
          </Marker>
        );
      });
    return (
      <Pane style={{ zIndex: 600 }}>
        {store.config.mapClusters ? (
          <MarkerClusterGroup
            options={{
              showCoverageOnHover: false,
              zoomToBoundsOnClick: true,
              removeOutsideVisibleBounds: true,
              elementsPlacementStrategy: 'clock-concentric',
              animate: false,
              singleMarkerMode: true,
              spiderLegPolylineOptions: { weight: 0 },
              clockHelpingCircleOptions: { weight: 0 }
            }}
          >
            {records}
          </MarkerClusterGroup>
        ) : (
          records
        )}
      </Pane>
    );
  }

  renderThisCoordinate() {
    return (
      <Pane style={{ zIndex: 700 }}>
        <Marker
          key={0}
          position={[parseFloat(store.recordY), parseFloat(store.recordX)]}
          icon={this.icon('fa fa-map-marker', 'color: #a64005', [20, 20])}
        >
          <Tooltip offset={[10, -10]} direction="right">
            <h4>{store.recordName}</h4>
          </Tooltip>
        </Marker>
      </Pane>
    );
  }

  renderGeonames() {
    return (
      <Pane style={{ zIndex: 500 }}>
        {store.geonames.filter(g => g && g.ll).map((geoname, gi) => {
          return (
            <Marker
              key={gi}
              className="geoname-point"
              position={[geoname.ll[0], geoname.ll[1]]}
              icon={this.icon('fa fa-map-marker', 'color: #D9AE5F', [20, 20])}
              onClick={this.handleClickGeoname.bind(this, geoname)}
            >
              <Tooltip offset={[10, -10]} direction="right">
                <h4>{'geoname: ' + geoname.toponymName}</h4>
              </Tooltip>
            </Marker>
          );
        })}
      </Pane>
    );
  }

  renderWikis() {
    return (
      <Pane style={{ zIndex: 500 }}>
        {store.wikis.filter(g => g && g.ll).map((wiki, gi) => {
          return (
            <Marker
              key={gi}
              className="wiki-point"
              position={[wiki.ll[0], wiki.ll[1]]}
              icon={this.icon('fa fa-map-marker', 'color: #5f8ad9', [20, 20])}
              onClick={this.handleClickGeoname.bind(this, wiki)}
            >
              <Tooltip offset={[10, -10]} direction="right">
                <h4>{'wikipedia: ' + wiki.title}</h4>
              </Tooltip>
            </Marker>
          );
        })}
      </Pane>
    );
  }

  renderHighlighted() {
    return (
      <LayerGroup key="hl-point">
        <CircleMarker
          className="hl-point"
          center={[store.hlPoint[0], store.hlPoint[1]]}
          radius={10}
        />
      </LayerGroup>
    );
  }

  render() {
    return (
      <div className="map-wrapped" style={this.style()}>
        <Map
          center={store.mapPosition}
          zoom={store.mapZoom}
          onViewportChanged={store.mapMoved}
          useFlyTo={true}
          ref="map"
          onClick={this.handleMapClick.bind(this)}
          style={this.mapStyle()}
          attributionControl={false}
          maxZoom={config.map.max}
          minZoom={config.map.min}
        >
          <ScaleControl position="topleft" imperial={false} />
          <AttributionControl position="bottomleft" />

          {this.renderBaseLayers()}
          {store.overlays.length > 0 && this.renderOverlays()}

          {store.validRecordCoordinates && this.renderThisCoordinate()}

          {store.config.displayOtherRecords && this.renderOtherRecords()}
          {store.config.displayGeonames && this.renderGeonames()}
          {store.config.displayWikis && this.renderWikis()}
          {store.hlPoint && this.renderHighlighted()}
        </Map>
      </div>
    );
  }
}

export default observer(AppMap);
