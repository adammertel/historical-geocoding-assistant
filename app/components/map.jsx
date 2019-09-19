import React from "react";
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
} from "react-leaflet";

require("leaflet.measure");
import { observer } from "mobx-react";
import MarkerClusterGroup from "react-leaflet-markercluster";
require("leaflet.markercluster.placementstrategies");
require("./../../node_modules/leaflet-geonames/L.Control.Geonames.js");

class AppMap extends React.Component {
  constructor(props) {
    super(props);
    this.markerSize = [25, 25];
    this.circleSize = 5;
  }

  markerOffset() {
    return [this.markerSize[0] / 2, (-1 * this.markerSize[1]) / 2];
  }
  suggestionOffset() {
    return [0, this.circleSize];
  }

  style() {
    return {};
  }

  componentDidMount() {
    window["map"] = this.refs.map.leafletElement;

    const measureCircleStyle = {
      fillColor: "black",
      weight: 0,
      fillOpacity: 1,
      radius: 3
    };

    window["measureControl"] = L.control
      .polylineMeasure({
        unit: config.mapMeasureUnits,
        measureControlTitleOn: "Measure",
        measureControlTitleOff: "Stop measuring",
        clearControlTitle: "Clear Measurements",
        clearControlLabel: "&times",
        measureControlLabel: "",
        tempLine: {
          color: "black", // Dashed line color
          weight: 2 // Dashed line weight
        },
        fixedLine: {
          color: "black", // Solid line color
          weight: 2 // Solid line weight
        },
        startCircle: measureCircleStyle,
        intermedCircle: measureCircleStyle,
        currentCircle: measureCircleStyle,
        endCircle: measureCircleStyle
      })
      .addTo(map);

    window["geonamesControl"] = L.control
      .geonames({
        //position: 'topcenter',  // in addition to standard 4 corner Leaflet control layout, this will position and size from top center
        geonamesURL: "//api.geonames.org/searchJSON", // override this if using a proxy to get connection to geonames
        username: "adammertel", // Geonames account username.  Must be provided
        zoomLevel: null, // Max zoom level to zoom to for location.  If null, will use the map's max zoom level.
        maxresults: 5, // Maximum number of results to display per search
        className: "leaflet-geonames-icon", //class for icon
        workingClass: "leaflet-geonames-icon-working", //class for search underway
        featureClasses: ["A", "H", "L", "P", "R", "T", "U", "V"], // feature classes to search against.  See: http://www.geonames.org/export/codes.html
        baseQuery: "isNameRequired=true", // The core query sent to GeoNames, later combined with other parameters above
        position: "topleft",
        showMarker: false, //Show a marker at the location the selected location
        showPopup: true, //Show a tooltip at the selected location

        lang: "en",
        alwaysOpen: false
      })
      .addTo(map);
  }

  mapStyle() {
    return {
      position: "absolute",
      left: "0",
      right: "400px",
      height: "100%"
    };
  }

  isMeasuring() {
    return window["measureControl"]._measuring;
  }

  handleClickMarker(rowId) {
    this.isMeasuring() ? false : store.gotoRecord(rowId);
  }

  handleClickGeoname(suggestion, e) {
    if (!this.isMeasuring()) {
      store.useSuggestion(suggestion);
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

    if (basemap.type === "tile") {
      return <TileLayer key={top ? "1" : "2"} opacity={opacity} {...basemap} />;
    } else if (basemap.type === "wms") {
      return (
        <WMSTileLayer key={top ? "1" : "2"} opacity={opacity} {...basemap} />
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
        {store.opts.overlays
          .filter(o => o.opacity)
          .map((o, oid) => {
            const overlay = overlaymaps[o.id];
            const zIndex = 400 - oid;

            if (overlay.type === "wms") {
              return (
                <WMSTileLayer
                  key={o.id}
                  zIndex={zIndex}
                  {...overlay}
                  opacity={o.opacity}
                />
              );
            } else if (overlay.type === "geojson") {
              const tooltip = (f, layer) => {
                if (
                  layer &&
                  f &&
                  f.properties &&
                  overlay.tooltip &&
                  f.properties[overlay.tooltip]
                )
                  layer.bindTooltip("" + f.properties[overlay.tooltip]);
              };

              return (
                <Pane style={{ zIndex: zIndex }} key={o.id} name={overlay.id}>
                  <GeoJSON
                    {...overlay}
                    opacity={o.opacity * overlay.opacity || o.opacity}
                    fillOpacity={o.opacity * overlay.fillOpacity}
                    onEachFeature={overlay.tooltip ? tooltip : false}
                  ></GeoJSON>
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
              "fa fa-map-marker",
              "color: " + config.colors.otherRecords,
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
            singleMarkerMode={false}
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
            "fa fa-map-marker",
            "color: " + config.colors.main,
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

  renderSuggestions(id, points, color) {
    return (
      <Pane style={{ zIndex: 500 }} className={"pane-" + id} key={"pane-" + id}>
        {points
          .filter(g => g && g.ll)
          .map((p, pi) => {
            return (
              <CircleMarker
                key={pi}
                className={"suggestion-point " + id + "-point"}
                radius={this.circleSize}
                center={[p.ll[0], p.ll[1]]}
                fillColor={color}
                onClick={this.handleClickGeoname.bind(this, p)}
              >
                <Tooltip direction="bottom" offset={this.suggestionOffset()}>
                  <h4>{id + ": " + p.name}</h4>
                </Tooltip>
              </CircleMarker>
            );
          })}
      </Pane>
    );
  }

  renderHighlighted() {
    return (
      <Pane
        style={{ zIndex: 800 }}
        className="pane-highlight"
        key="pane-highlight"
      >
        <LayerGroup key="hl-point">
          <CircleMarker
            className="hl-point"
            center={[store.hlPoint[0], store.hlPoint[1]]}
            radius={10}
          />
        </LayerGroup>
      </Pane>
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
          worldCopyJump={true}
        >
          <ScaleControl position="topleft" imperial={true} />
          <AttributionControl position="bottomleft" />
          {this.renderBaseLayers()}
          {store.hlPoint && this.renderHighlighted()}
          {store.opts.overlays.length > 0 && this.renderOverlays()}
          {store.validRecordCoordinates && this.renderThisCoordinate()}
          {store.opts.displayOtherRecords && this.renderOtherRecords()}

          {SuggestionSources.filter(
            s =>
              !store.loadingSuggestions[s.id] && store.displaySuggestions[s.id]
          ).map(source =>
            this.renderSuggestions(
              source.id,
              store.suggestions[source.id],
              config.colors[source.id]
            )
          )}
        </Map>
      </div>
    );
  }
}

export default observer(AppMap);
