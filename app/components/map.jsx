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
    appStore.gotoRecord(rowId);
  }

  handleClickGeoname(geoname, e) {
    appStore.useGeoname(geoname);
    console.log(e);
    console.log(e.target);
    map.closeTooltip(e.target._tooltip);
  }

  handleMapClick(e) {
    appStore.updateRecordLocation(e.latlng.lng, e.latlng.lat);
  }

  renderBaseLayer(top) {
    const basemap = top ? appStore.basemap1 : appStore.basemap2;
    const opacity = top ? 1 - appStore.mapOpacityRatio : appStore.mapOpacityRatio;

    if (basemap.type === 'tile') {
      return <TileLayer key={top ? '1' : '2'} opacity={opacity} {...basemap} />;
    } else if (basemap.type === 'wms') {
      return <WMSTileLayer key={top ? '1' : '2'} opacity={opacity} {...basemap} />;
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
        {appStore.overlays.map((o, oid) => {
          const overlay = overlaymaps[o.id];
          const zIndex = 400 - oid;

          if (overlay.type === 'wms') {
            return <WMSTileLayer key={o.id} zIndex={zIndex} {...overlay} opacity={o.opacity} />;
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

  render() {
    const store = appStore;
    const icon = (classes, style, size) => {
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
    };

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
          maxZoom={18}
        >
          <ScaleControl position="topleft" imperial={false} />
          <AttributionControl position="bottomleft" />
          {/* basemaps */
            this.renderBaseLayers()}
          {/* overlays */
            appStore.overlays.length > 0 && this.renderOverlays()}

          <Pane style={{ zIndex: 500 }}>
            {/* all geonames points  */
              store.config.displayGeonames
                ? appStore.geonames.filter(g => g && g.ll).map((geoname, gi) => {
                  return (
                    <Marker
                      key={gi}
                      className="geoname-point"
                      position={[geoname.ll[0], geoname.ll[1]]}
                      icon={icon('fa fa-map-marker', 'color: #D9AE5F', [20, 20])}
                      onClick={this.handleClickGeoname.bind(this, geoname)}
                    >
                      <Tooltip offset={[10, -10]} direction="right">
                        <h4>{'geoname: ' + geoname.toponymName}</h4>
                      </Tooltip>
                    </Marker>
                  );
                })
                : null}
          </Pane>

          <Pane style={{ zIndex: 500 }}>
            {/* all wikipedia points  */
              store.config.displayWikis
                ? appStore.wikis.filter(g => g && g.ll).map((wiki, gi) => {
                  return (
                    <Marker
                      key={gi}
                      className="wiki-point"
                      position={[wiki.ll[0], wiki.ll[1]]}
                      icon={icon('fa fa-map-marker', 'color: #5f8ad9', [20, 20])}
                      onClick={this.handleClickGeoname.bind(this, wiki)}
                    >
                      <Tooltip offset={[10, -10]} direction="right">
                        <h4>{'wikipedia: ' + wiki.title}</h4>
                      </Tooltip>
                    </Marker>
                  );
                })
                : null}
          </Pane>

          <Pane style={{ zIndex: 600 }}>
            {// rendering records
              store.config.displayOtherRecords
                ? store.geoRecords.filter(Base.validGeo).map((record, ri) => {
                  const active = record.row.toString() === appStore.recordRow.toString();
                  const style = active ? 'color: #A64005' : 'color: black';

                  return (
                    <Marker
                      key={ri}
                      position={[parseFloat(record.y), parseFloat(record.x)]}
                      icon={icon('fa fa-map-marker', style, [20, 20])}
                      onClick={this.handleClickMarker.bind(this, record.row)}
                    >
                      <Tooltip offset={[10, -10]} direction="right">
                        <h4>{record.name}</h4>
                      </Tooltip>
                    </Marker>
                  );
                })
                : appStore.validRecordCoordinates && (
                  <Marker
                    key={0}
                    position={[parseFloat(appStore.recordY), parseFloat(appStore.recordX)]}
                    icon={icon('fa fa-map-marker', 'color: black', [20, 20])}
                  >
                    <Tooltip offset={[10, -10]} direction="right">
                      <h4>{appStore.recordName}</h4>
                    </Tooltip>
                  </Marker>
                )}
          </Pane>
          {/* geoname point */
            appStore.hlPoint ? (
              <LayerGroup key="hl-point">
                <CircleMarker className="hl-point" center={[appStore.hlPoint[0], appStore.hlPoint[1]]} radius={10} />
              </LayerGroup>
            ) : null}
        </Map>
      </div>
    );
  }
}

export default observer(AppMap)