var Base =  {
  doRequestSync (url) {
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.open('GET', url, false);
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.send();

    if (xhr.status === 200) {
      return xhr.responseText;
    } else {
      return {};
    }
  },

  doRequestAsync (url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    //xhr.withCredentials = true;
    xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET');
    xhr.setRequestHeader('Content-Type', '*');


    xhr.onload = (e) => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          return xhr.responseText;
        } else {
          console.log(xhr.statusText);
          return {}
        }
      } else {
        return {}
      }
    }

    xhr.send();
  },

  requestConfigFile (configName, sync, next = false) {
    const configPath = './' + configName;
    if (sync) {
      return JSON.parse(this.doRequestSync(configPath));
    } else {
      this.doRequest (configPath, (response) => {next(JSON.parse(response));});
    }
  },

  wiki (term) {
    const path = 'https://en.wikipedia.org/w/api.php?' + 
      'format=xml&action=query&prop=extracts&' + 
      'titles=' +  term + 
      '&redirects=true&format=json';
    
    const res = this.doRequestAsync(path);
    if (res.query && res.query.pages) {
      const pgs = res.query.pages;
      return pgs[Object.keys(pgs)[0]].extract;
    }
    return 'not found';

  }

};

module.exports = Base;