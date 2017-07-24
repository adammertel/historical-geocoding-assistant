import React from 'react';
import { Map, TileLayer, AttributionControl, CircleMarker, Tooltip, Popup, LayerGroup } from 'react-leaflet';

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

  validateGeo(feat) {
    return isFinite(feat.x) && feat.x && isFinite(feat.y) && feat.y;
  }

  mapStyle() {
    return {
      width: '100%',
      height: '100%'
    }
  }

  styleMarker(active) {
    return {
      fillColor: active ? 'red' : 'orange',
      color: 'black',
      fillOpacity: .8,
      weight: active ? 2 : 1,
      radius: active ? 3 : 2,
    }
  }

  handleClickCircle(rowId) {
    appStore.gotoRecord(rowId);
  }

  render() {
    const store = appStore;
    
    return (
      <div className="map-wrapped" style={this.style()} >
        <Map 
          center={[50,10]}
          zoom={5}
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
            store.geoRecords.filter(this.validateGeo).map( (record, ri) => {
              const active = record.row.toString() === appStore.recordRow.toString()
              const style = this.styleMarker(active);

              return (
                <LayerGroup key={ri}>
                  <CircleMarker 
                    center={[parseFloat(record.y), parseFloat(record.x)]} 
                    {...style}
                  />
                  <CircleMarker
                    center={[parseFloat(record.y), parseFloat(record.x)]}
                    radius={5} fillOpacity={0} opacity={0}
                    onClick={this.handleClickCircle.bind(this, record.row)}
                  >
                    <Tooltip>
                      <h4>{record.name}</h4>
                    </Tooltip>
                  </CircleMarker>
                </LayerGroup>
              )
            })
          }
        </Map>
      </div>
    )
  }
}