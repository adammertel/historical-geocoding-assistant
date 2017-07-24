import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';


@observer
export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      position: 'absolute',
      top: 0,
      width: '100%',
      zIndex: 9999
    }
  }

  handleMapSelect(id, e) {
    appStore.changeBaseMap(id, e.target.value);
  }

  handleOpacityRatio(e) {
    appStore.changeOpacityRatio(e.target.value / 100);
  }

  render() {
    const store = appStore;
    
    return (
      <div className="panel-wrapper" style={this.style()} >
        <nav className="navbar">
          <div className="navbar-brand">
            <a className="navbar-item">
              <img src="http://bulma.io/images/bulma-logo.png" alt="Bulma: a modern CSS framework based on Flexbox" width="112" height="28" />
            </a>
          </div>
          <div className="navbar-menu">

            <div className="navbar-item">
              <span className="select">
                <select value={store.map1Id} onChange={this.handleMapSelect.bind(this, 1)}>
                  {
                    Object.keys(basemaps).map(basemapId => {
                      const basemap = basemaps[basemapId];
                      return (
                        <option value={basemapId} key={basemapId} >{basemap.name}</option>
                      )
                    })
                  }
                </select>
              </span>
            </div>

            <div className="navbar-item">
              <div 
                style={{
                  position: 'absolute',
                  top: 7,
                  fontWeight: 600
                }}
              >opacity:</div>
              <input 
                style={{
                  marginTop: 20
                }}
                value={store.mapOpacityRatio * 100}
                onChange={this.handleOpacityRatio.bind(this)}
                type="range" min="0" max="100" step="1" className="navbar-slider slider" />
            </div>
            
            <div className="navbar-item">
              <span className="select">
                <select value={store.map2Id} onChange={this.handleMapSelect.bind(this, 2)}>
                  {
                    Object.keys(basemaps).map(basemapId => {
                      const basemap = basemaps[basemapId];
                      return (
                        <option value={basemapId} key={basemapId} >{basemap.name}</option>
                      )
                    })
                  }
                </select>
              </span>
            </div>


          </div>
        </nav>
      </div>
    )
  }
}