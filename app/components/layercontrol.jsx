import React from 'react';
import { observer } from 'mobx-react';

import Menu from './menu';
import Base from './../base';


@observer
export default class LayerControl extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      position: 'absolute',
      bottom: 50,
      left: 30,
      opacity: .9,
      padding: 20,
      backgroundColor: 'white',
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
      <div className="layercontrol-wrapper" style={this.style()} >
        <h4 className="title is-4" style={{color: 'black', fontWeight: 600}}>Map control</h4>
        <Menu label="base layers" defaultOpen={true}>
          <div>
            <table className="table" style={{fontSize: 11}}>
              <tbody>
                <tr>
                  <td>top layer</td>
                  <td>
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
                  </td>
                </tr>
                
                <tr>
                  <td>opacity</td>
                  <td>
                    <input 
                      style={{}}
                      value={store.mapOpacityRatio * 100}
                      onChange={this.handleOpacityRatio.bind(this)}
                      type="range" min="0" max="100" step="1" className="navbar-slider slider" 
                    />
                  </td>
                </tr>
                
                <tr>
                  <td>bottom layer</td>
                  <td>
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
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Menu>
        <Menu label="other layers" defaultOpen={true}>
          <div />
        </Menu>
      </div>
    )
  }
}