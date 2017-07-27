import React from 'react';
import { Map, TileLayer, AttributionControl, CircleMarker, Tooltip, Popup, Marker, LayerGroup } from 'react-leaflet';
import { divIcon } from 'leaflet';

import { observer } from 'mobx-react';

import Base from './../base';


@observer
export default class AppMap extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {

    }
  }


  mapStyle() {
    return {
      width: '100%',
      height: '100%'
    }
  }

  handleClickMarker(rowId) {
    appStore.gotoRecord(rowId);
  }

  handleDragMarker(e) {
    const targetLatLng = e.target._latlng;
    appStore.updateRecordLocation(targetLatLng.lng, targetLatLng.lat);
  }

  render() {
    const store = appStore;
    
    return (
      <div className="map-wrapped" style={this.style()} >
        <Map 
          center={store.mapPosition}
          zoom={store.mapZoom}
          onViewportChanged={store.mapMoved}
          useFlyTo={true}
          ref="map" 
          style={this.mapStyle()}
          attributionControl={false}
        >
          <AttributionControl position="bottomleft" />
          <TileLayer key={2} opacity={store.mapOpacityRatio}
              {...store.basemap2}
          />  
          <TileLayer key={1}  opacity={1 - store.mapOpacityRatio}
              {...store.basemap1}
          />  
          {
            // rendering records
            store.geoRecords.filter(Base.validGeo).map( (record, ri) => {
              const active = record.row.toString() === appStore.recordRow.toString()
              //const style = this.styleMarker(active);

              const iconClasses = active ? 'icon is-medium' : 'icon is-small';
              const iconSize = [20, 20];
              const style = active ? 
                "color: #00d1b2; vertical-align: bottom" : 
                "color: black; vertical-align: bottom";

              const icon = divIcon({
                html: '<span style="' + style + '" class="icon"><i class="fa fa-map-marker"></i></span>',
                className: 'map-sort-icon',
                iconAnchor: [iconSize[0]/2, iconSize[1]],
                iconSize: iconSize
              });

              return (
                <LayerGroup key={ri}>
                  <Marker 
                    position={[parseFloat(record.y), parseFloat(record.x)]} 
                    icon={icon}
                    onClick={this.handleClickMarker.bind(this, record.row)}
                    draggable={active}
                    onDragEnd={this.handleDragMarker.bind(this)}
                  >
                    <Tooltip offset={[10, -10]}>
                      <h4>{record.name}</h4>
                    </Tooltip>
                  </Marker>
                </LayerGroup>
              )
            })
          }
          {
            /* geoname point */
            appStore.geonamePoint ?
              (
                <LayerGroup key="geoname point" >
                  <CircleMarker center={[appStore.geonamePoint[0], appStore.geonamePoint[1]]} radius={10} />
                </LayerGroup>
              ) : null

          }
        </Map>
      </div>
    )
  }
}