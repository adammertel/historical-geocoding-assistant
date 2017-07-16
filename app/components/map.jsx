import React from 'react';
import { Map, TileLayer } from 'react-leaflet';

import { observer } from 'mobx-react';

import Base from './../base';


@observer
export default class AppMap extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      width: '100%',
      height: '100%'
    }
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
        >
          <TileLayer 
              key="a"
              url="http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
              zIndex={1}
              opacity={store.map1Opacity}
              attribution="<a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>"
            />  
        </Map>
      </div>
    )
  }
}