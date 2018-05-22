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

require('leaflet.measure');
import { observer } from 'mobx-react';
import MarkerClusterGroup from 'react-leaflet-markercluster';
require('leaflet.markercluster.placementstrategies');

class AppMap extends React.Component {
  constructor(props) {
    super(props);
    this.markerSize = [25, 25];
  }

  markerOffset() {
    return [this.markerSize[0] / 2, -1 * this.markerSize[1] / 2];
  }

  style() {
    return {};
  }

  componentDidMount() {
    window['map'] = this.refs.map.leafletElement;
    const measureCircleStyle = {
      fillColor: 'black',
      weight: 0,
      fillOpacity: 1,
      radius: 3
    };
    window['measureControl'] = L.control
      .polylineMeasure({
        unit: config.mapMeasureUnits,
        measureControlTitleOn: 'Measure',
        measureControlTitleOff: 'Stop measuring',
        clearControlTitle: 'Clear Measurements',
        clearControlLabel: '&times',
        measureControlLabel: '&#128207;',
        tempLine: {
          color: 'black', // Dashed line color
          weight: 2 // Dashed line weight
        },
        fixedLine: {
          color: 'black', // Solid line color
          weight: 2 // Solid line weight
        },
        startCircle: measureCircleStyle,
        intermedCircle: measureCircleStyle,
        currentCircle: measureCircleStyle,
        endCircle: measureCircleStyle
      })
      .addTo(map);
  }

  mapStyle() {
    return {
      position: 'absolute',
      left: '0',
      right: '400px',
      height: '100%'
    };
  }

  isMeasuring() {
    return window['measureControl']._measuring;
  }

  handleClickMarker(rowId) {
    this.isMeasuring() ? false : store.gotoRecord(rowId);
  }

  handleClickGeoname(geoname, e) {
    if (!this.isMeasuring()) {
      store.useGeoname(geoname);
      map.closeTooltip(e.target._tooltip);
    }
  }

  handleMapClick(e) {
    this.isMeasuring()
      ? false
      : store.updateRecordLocation(e.latlng.lng, e.latlng.lat);
  }

  renderBaseLayer(top) {
    const basemap = top ? store.basemap1 : store.basemap2;
    const opacity = top
      ? 1 - store.opts.basemaps.opacity
      : store.opts.basemaps.opacity;

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
        {store.opts.overlays.map((o, oid) => {
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

  renderOtherRecords() {
    const records = store.geoRecords
      .filter(r => Base.validGeo([r.x, r.y]))
      .filter(r => !Base.same(r.row, store.row))
      .map((record, ri) => {
        return (
          <Marker
            key={ri}
            position={[parseFloat(record.y), parseFloat(record.x)]}
            icon={Base.icon(
              'fa fa-map-marker',
              'color: ' + config.colors.otherRecords,
              this.markerSize
            )}
            onClick={this.handleClickMarker.bind(this, record.row)}
          >
            <Tooltip offset={this.markerOffset()} direction="right">
              <h4>{record.name}</h4>
            </Tooltip>
          </Marker>
        );
      });
    return (
      <Pane style={{ zIndex: 600 }}>
        {store.opts.mapClusters ? (
          <MarkerClusterGroup
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            removeOutsideVisibleBounds={true}
            elementsPlacementStrategy="clock-concentric"
            animate={false}
            singleMarkerMode={true}
            spiderLegPolylineOptions={{ weight: 0 }}
            clockHelpingCircleOptions={{ weight: 0 }}
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
          icon={Base.icon(
            'fa fa-map-marker',
            'color: ' + config.colors.main,
            this.markerSize
          )}
        >
          <Tooltip offset={this.markerOffset()} direction="right">
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
              icon={Base.icon(
                'fa fa-map-marker',
                'color: ' + config.colors.geonames,
                this.markerSize
              )}
              onClick={this.handleClickGeoname.bind(this, geoname)}
            >
              <Tooltip offset={this.markerOffset()} direction="right">
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
              icon={Base.icon(
                'fa fa-map-marker',
                'color: ' + config.colors.wikipedia,
                this.markerSize
              )}
              onClick={this.handleClickGeoname.bind(this, wiki)}
            >
              <Tooltip offset={this.markerOffset()} direction="right">
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
          zoom={store.opts.mapZoom}
          onViewportChanged={store.mapMoved}
          useFlyTo={true}
          ref="map"
          onClick={this.handleMapClick.bind(this)}
          style={this.mapStyle()}
          attributionControl={false}
          maxZoom={config.map.zoomMax}
          minZoom={config.map.zoomMin}
        >
          <ScaleControl position="topleft" imperial={true} />
          <AttributionControl position="bottomleft" />

          {this.renderBaseLayers()}
          {store.opts.overlays.length > 0 && this.renderOverlays()}

          {store.validRecordCoordinates && this.renderThisCoordinate()}

          {store.opts.displayOtherRecords && this.renderOtherRecords()}
          {store.opts.displayGeonames && this.renderGeonames()}
          {store.opts.displayWikis && this.renderWikis()}
          {store.hlPoint && this.renderHighlighted()}
        </Map>
      </div>
    );
  }
}

export default observer(AppMap);
