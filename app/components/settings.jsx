import React from 'react';
import { observer } from 'mobx-react';
import { Map, TileLayer} from 'react-leaflet';
import Button from './button';
import Base from './../base';


@observer
export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    const store = appStore;
    this.state = {
      focusZoom: store.config.focusZoom,
      focusOnRecordChange: store.config.focusOnRecordChange,
      maxGeoExtent: store.config.maxGeoExtent,
      wikiNoColumns: store.config.wikiNoColumns,
      geonameMaxResults: store.config.geonameMaxResults,
    }

    this.options = {
      geonameMaxResults: [3, 5, 10, 15, 20],
      focusZoom: [8, 9, 10, 11, 12, 13, 14, 15],
      focusOnRecordChange: [1, 0],
      wikiNoColumns: [1, 2, 3, 4, 5, 10]
    }
  }

  style() {
    return {
      zIndex: 10000
    }
  }

  mapStyle() {
    return {
      width: '100%',
      height: '100%'
    }
  }

  handleSave() {
    appStore.saveSettings(this.state);
    appStore.closeSettings();
  }

  handleClose() {
    appStore.closeSettings();
  }

  handleGeoExtentChange(e) {
    if (this.refs.refMap) {
      const bounds = this.refs.refMap.leafletElement.getBounds()

      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      this.setState({
        maxGeoExtent: [[sw.lat, sw.lng], [ne.lat, ne.lng]]
      })
    }
  }

  handleChangeSelect(propName, e) {
    const newState = {};
    const value = e.target.value;
    newState[propName] = parseInt(e.target.value, 10);
    this.setState(newState);
  }

  renderSelect(propName, propLabel) {
    return (
      <div className="field columns is-gapless">
        <div className="column has-text-right">
          <label style={{marginRight: 10, marginTop: 5}} className="label">{propLabel}</label>
        </div>
        <div className="control column">
          <div className="select">
            <select value={this.state[propName]} onChange={this.handleChangeSelect.bind(this, propName)} >
              {
                this.options[propName].map( (option, oi) => {
                  return (
                    <option key={oi} value={option}>{option}</option>
                  )
                })
              }
            </select>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const store = appStore;

    const extent = this.state.maxGeoExtent;
    const bounds = [
      [extent[0][0], extent[0][1]],
      [extent[1][0], extent[1][1]]
    ];

    const basemap = appStore.basemapById('OSM');
    
    return (
      <div className="modal is-active" style={this.style()}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Global Settings</p>
          </header>
          <section className="modal-card-body">
            {this.renderSelect('geonameMaxResults', 'max geonames to search')}          
            {this.renderSelect('focusZoom', 'level of zoom on focus')}          
            {this.renderSelect('focusOnRecordChange', 'focus on record change? (1 = on)')}
            {this.renderSelect('wikiNoColumns', 'max columns from wikipedia')}
            <div className="field columns is-gapless">
              <div className="column has-text-right">
                <label style={{marginRight: 10, marginTop: 5}} className="label">Geo extent</label>
              </div>
              <div className="control column">
                <Map 
                  zoomControl={false} 
                  zoomSnap={0.1} 
                  ref="refMap" 
                  bounds={bounds} 
                  onViewportChanged={this.handleGeoExtentChange.bind(this)} 
                  style={{width: '100%', height: 200}}
                >
                  <TileLayer {...basemap} />  
                </Map>
              </div>
            </div>          
          </section>
          <footer className="modal-card-foot">
            <div className="container has-text-right">
              <Button className="" icon="floppy-o" label="save and close"
                onClick={this.handleSave.bind(this)} />
              <Button className="" icon="times-circle" label="close without save"
                onClick={this.handleClose.bind(this)} />
            </div>
          </footer>
        </div>
      </div>
    )
  }
}