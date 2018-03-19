import React from 'react';
import { observer } from 'mobx-react';

import Menu from './../bulma/menu';
import Button from './../bulma/button';
import Slider from './../bulma/slider';

class LayerControl extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      position: 'absolute',
      bottom: 50,
      left: 30,
      opacity: 0.9,
      fontSize: 12,
      padding: '15px 15px 0px 15px',
      backgroundColor: 'white',
      zIndex: 1100
    };
  }

  handleMapSelect(id, e) {
    store.changeBaseMap(id, e.target.value);
  }

  handleOverlaySelect(select, e) {
    store.addOverlay(e.target.value);
  }

  handleOpacityRatio(e) {
    store.changeOpacityRatio(e.target.value / 100);
  }

  handleOverlayOpacity(oid, e) {
    store.overlayChangeOpacity(oid, e.target.value / 100);
  }

  handleRemoveOverlay(oid) {
    store.overlayRemove(oid);
  }

  handleMoveOverlayUp(oid) {
    store.overlayMoveUp(oid);
  }

  handleMoveOverlayDown(oid) {
    store.overlayMoveDown(oid);
  }

  render() {
    return (
      <div className="layercontrol-wrapper" style={this.style()}>
        <h5
          className="title is-5"
          style={{ color: 'black', fontWeight: 600, marginBottom: 10 }}
        >
          Map control
        </h5>
        <Menu label="base layers" defaultOpen={true}>
          <div>
            <table className="table centered" style={{ fontSize: 11 }}>
              <tbody>
                <tr>
                  <td>top layer</td>
                  <td>
                    <div className="select">
                      <select
                        value={store.opts.basemaps.map1}
                        onChange={this.handleMapSelect.bind(this, 1)}
                      >
                        {Object.keys(basemaps).map(basemapId => {
                          const basemap = basemaps[basemapId];
                          return (
                            <option value={basemapId} key={basemapId}>
                              {basemap.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>opacity</td>
                  <td>
                    <Slider
                      value={store.opts.basemaps.opacity * 100}
                      onChange={this.handleOpacityRatio.bind(this)}
                      min="0"
                      max="100"
                      step="1"
                      classes=""
                    />
                  </td>
                </tr>

                <tr>
                  <td>bottom layer</td>
                  <td>
                    <div className="select">
                      <select
                        value={store.opts.basemaps.map2}
                        onChange={this.handleMapSelect.bind(this, 2)}
                      >
                        {Object.keys(basemaps).map(basemapId => {
                          const basemap = basemaps[basemapId];
                          return (
                            <option value={basemapId} key={basemapId}>
                              {basemap.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Menu>
        <Menu label="overlay layers" defaultOpen={false}>
          <div>
            <table className="table centered" style={{ fontSize: 11 }}>
              <tbody>
                {store.opts.overlays.map(overlay => {
                  return (
                    <tr key={overlay.id}>
                      <td>{overlaymaps[overlay.id].name}</td>
                      <td>
                        <Slider
                          value={overlay.opacity * 100}
                          onChange={this.handleOverlayOpacity.bind(
                            this,
                            overlay.id
                          )}
                          min="0"
                          max="100"
                          step="1"
                          classes=""
                        />
                      </td>
                      <td>
                        <Button
                          icon="arrow-up"
                          label=""
                          classes="is-inverted"
                          onClick={this.handleMoveOverlayUp.bind(
                            this,
                            overlay.id
                          )}
                          style={{ marginTop: -3 }}
                        />
                        <Button
                          icon="arrow-down"
                          label=""
                          classes="is-inverted"
                          onClick={this.handleMoveOverlayDown.bind(
                            this,
                            overlay.id
                          )}
                          style={{ marginTop: -3 }}
                        />
                        <Button
                          icon="trash-o"
                          label=""
                          classes="is-inverted"
                          onClick={this.handleRemoveOverlay.bind(
                            this,
                            overlay.id
                          )}
                          style={{ marginTop: -3 }}
                        />
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td>
                    <b>select overlay to add</b>
                  </td>
                  <td>
                    <span className="select">
                      <select
                        value="default"
                        onChange={this.handleOverlaySelect.bind(this, 1)}
                      >
                        {Object.keys(overlaymaps).map(overlayId => {
                          const overlay = overlaymaps[overlayId];
                          return (
                            <option value={overlayId} key={overlayId}>
                              {overlay.name}
                            </option>
                          );
                        })}
                      </select>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Menu>
      </div>
    );
  }
}

export default observer(LayerControl);
