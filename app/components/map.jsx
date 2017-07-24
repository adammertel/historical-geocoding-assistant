import React from 'react';
import { Map, TileLayer, AttributionControl, CircleMarker } from 'react-leaflet';

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
              return (
                <CircleMarker 
                  key={ri} 
                  center={[parseFloat(record.y), parseFloat(record.x)]} 
                  radius={3} 
                />
              )
            })
          }
        </Map>
      </div>
    )
  }
}