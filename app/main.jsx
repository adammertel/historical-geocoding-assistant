import React from 'react';
import auth0 from 'auth0-js';
import ReactDOM from 'react-dom';

import App from './components/app';
import './main.css';
import AppStore from './appstore.js';
import Base from './base.js'
import Sheet from './sheet.js'

import './../ext/leaflet/dist/leaflet.css';


Sheet.init( () => {
  // Sheet.readLine(1, (vals) => console.log(vals));
  // Sheet.readLine(2, (vals) => console.log(vals));
  // Sheet.updateLine(68, ['test'], (vals) => console.log(vals));

  window['appStore'] = new AppStore();
  window['map'] = false;
  window['config'] = Base.requestConfigFile('config.json', true);

  ReactDOM.render(
    <App store={appStore} />,
    document.body.appendChild(document.createElement('div'))
  );

})
