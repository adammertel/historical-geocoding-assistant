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
  Sheet.readLine(1, (vals) => console.log(vals));
  Sheet.readLine(2, (vals) => console.log(vals));
  Sheet.updateLine(68, ['test'], (vals) => console.log(vals));

})


// const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + sId + '/values/' + range + '?key=' + key + '&valueInputOption=RAW'


  
// const dataToUpdate = {
//   "values": [
//     [null,"4/1/2016", "4/15/2016", ""]
//   ]
// }

// const auth = () => {
//   gapi.client.setApiKey(key);
//   gapi.auth2.init({
//     'clientId': clientId,
//     'scope': scopes,
//   }).then(function(result) {
//     const auth2 = gapi.auth2.getAuthInstance();
//     auth2.isSignedIn.listen(afterSignIn);
//     auth2.isSignedIn.get() ? afterSignIn() : auth2.signIn();
//   });
// }
// const afterSignIn = (res) => {
//   console.log(res);
//   console.log('authenticated successfully');

//   gapi.client.request({
//     'path': url,
//     'method': 'PUT',
//     'body': dataToUpdate
//   }).then(
//     (response) => console.log(response),
//     (response) => console.log(response)   
//   )
// }


// gapi.load('client:auth2', auth);
// const auth = new auth0.WebAuth({
//   domain: 'YOUR_AUTH0_DOMAIN',
//   clientID: 'YOUR_CLIENT_ID',
//   redirectUri: 'http://localhost:3000',
//   audience: 'https://YOUR_AUTH0_DOMAIN/userinfo',
//   responseType: 'token id_token',
//   scope: 'openid'
// });

//auth.authorize();


// get test

// const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + sId + '/values/' + range + '?key=' + key

// let xhr = new XMLHttpRequest();
// xhr.open('GET', url, false);
// xhr.send(null);

// if (xhr.status === 200) {
//   console.log(xhr.responseText);
// } else {
//   console.log('no response');
// }

// const dataToUpdate = {
//   "values": [
//     [null,"4/1/2016", "4/15/2016", ""]
//   ]
// }

// // put test
// let xhr2 = new XMLHttpRequest();
// xhr2.open('PUT', url, false);
// xhr2.setRequestHeader('Content-Type', 'application/json');
// xhr2.send(JSON.stringify(dataToUpdate));

// if (xhr2.status === 200) {
//   console.log(xhr2.responseText);
// } else {
//   console.log('no response');
// }


window['appStore'] = new AppStore();
window['map'] = false;
window['config'] = Base.requestConfigFile('config.json', true);

ReactDOM.render(
  <App />,
  document.body.appendChild(document.createElement('div'))
);
