import React from 'react';
import { observer } from 'mobx-react';

import Menu from './../bulma/menu';
import Button from './../bulma/button';
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
      padding: '15px 15px 0px 15px',
      backgroundColor: 'white',
      zIndex: 9999
    }
  }

  handleMapSelect(id, e) {
    appStore.changeBaseMap(id, e.target.value);
  }

  handleOverlaySelect(select, e) {
    appStore.addOverlay(e.target.value);
  }

  handleOpacityRatio(e) {
    appStore.changeOpacityRatio(e.target.value / 100);
  }

  handleOverlayOpacity(oid, e) {
    appStore.overlayChangeOpacity(oid, e.target.value / 100);
  } 

  handleRemoveOverlay(oid) {
    appStore.overlayRemove(oid);
  }

  handleMoveOverlayUp(oid) {
    appStore.overlayMoveUp(oid);
  }

  handleMoveOverlayDown(oid) {
    appStore.overlayMoveDown(oid);
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
                      type="range" min="0" max="100" step="1" className="slider" 
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
        <Menu label="overlay layers" defaultOpen={false}>
          <div>
            {
              appStore.overlays.length ? 
              (<span style={{marginLeft: 8}}>Active Overlays</span>) : null
            }
            <table className="table" style={{fontSize: 11}}>
              <tbody>
                {
                  appStore.overlays.map(overlay => {
                    return (
                      <tr key={overlay.id}>
                        <td>{overlaymaps[overlay.id].name}</td>
                        <td>
                          <input 
                            style={{}}
                            value={overlay.opacity * 100}
                            onChange={this.handleOverlayOpacity.bind(this, overlay.id)}
                            type="range" min="0" max="100" step="1" className="slider" 
                          />
                        </td>
                        <td>
                          <Button 
                            icon="arrow-up" label="" 
                            className="is-inverted" 
                            onClick={this.handleMoveOverlayUp.bind(this, overlay.id)}
                            style={{marginTop: -3}} 
                          />
                          <Button 
                            icon="arrow-down" label="" 
                            className="is-inverted" 
                            onClick={this.handleMoveOverlayDown.bind(this, overlay.id)}
                            style={{marginTop: -3}} 
                          />
                          <Button 
                            icon="trash-o" label="" 
                            className="is-inverted" 
                            onClick={this.handleRemoveOverlay.bind(this, overlay.id)}
                            style={{marginTop: -3}} 
                          />
                        </td>
                      </tr>
                    );
                  })
                }
                <tr><td>
                  <span className="select">
                    <select 
                      value="default" 
                      onChange={this.handleOverlaySelect.bind(this, 1)}>
                      <option value="default" key="default">select overlay to add</option>
                      {
                        Object.keys(overlaymaps).map(overlayId => {
                          const overlay = overlaymaps[overlayId];
                          return (
                            <option value={overlayId} key={overlayId} >{overlay.name}</option>
                          )
                        })
                      }
                    </select>
                  </span>
                </td></tr>
              </tbody>
            </table>
          </div>
        </Menu>
      </div>
    )
  }
}