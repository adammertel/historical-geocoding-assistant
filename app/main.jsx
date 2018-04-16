import ReactDOM from 'react-dom';
import React from 'react';

import App from './components/app';
import './main.scss';
import AppStore from './appstore.js';
import Sheet from './sheet.js';
import Base from './base.js';

const TESTING = false;
console.log('testing mode', TESTING);

window['version'] = '1.1.0';

// global variables
window['map'] = false;
window['Base'] = Base;

// load map layers
window['basemaps'] = require('./configs/basemaps.json');
window['overlaymaps'] = require('./configs/mapoverlays.json');
Object.keys(overlaymaps)
  .filter(o => overlaymaps[o].type === 'geojson')
  .map(okey => {
    const geojsonData = require('./assets/' + overlaymaps[okey].file);
    overlaymaps[okey].data = JSON.parse(geojsonData);
  });

window['store'] = new AppStore();

// assigning config. If TESTING === true, config will be extended with config_testing.json
const configPath = TESTING ? 'config.json' : 'config_testing.json';
const configData = require('./configs/' + configPath);
const configApi = require('./configs/config_api.json');
window['config'] = Object.assign(configData, configApi);
store.loadConfig(config);

ReactDOM.render(
  <App />,
  document.body.appendChild(document.createElement('div'))
);

window['sheetId'] = location.hash.substring(1);
window['initSheet'] = () => {
  store.changeLoadingStatus('signing');
  Sheet.init(() => store.init());
};

if (sheetId) {
  initSheet();
} else {
  store.changeLoadingStatus('prompting table');
}
