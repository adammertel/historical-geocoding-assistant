import ReactDOM from 'react-dom';

import React from 'react';
import App from './components/app';
import './main.scss';
import AppStore from './appstore.js';
import Sheet from './sheet.js';
import Base from './base.js';

const testing = true;
console.log('testing mode', testing);

window['map'] = false;
window['Base'] = Base;
window['basemaps'] = Base.requestConfigFile('basemaps.json', true);
window['overlaymaps'] = Base.processOverlayData();
window['config'] = Base.requestConfigFile('config.json', true);

window['appStore'] = new AppStore();
ReactDOM.render(<App />, document.body.appendChild(document.createElement('div')));

if (location.hash === '') {
  window['sheetId'] = prompt('Please enter id of your google sheet', '1Lanj90Z1fWTXKF7CBnCF6SyrHSNOZRoEEkiN9blg4dA');
  console.log('sheet will be initialised');
  location.hash = window['sheetId'];
} else {
  window['sheetId'] = location.hash.substring(1);
}

if (sheetId !== null) {
  Sheet.init(() => {
    // Sheet.readLine(1, (vals) => console.log(vals));
    // Sheet.readLine(2, (vals) => console.log(vals));
    // Sheet.updateLine(68, ['test'], (vals) => console.log(vals));
    appStore.init();
  });
}
