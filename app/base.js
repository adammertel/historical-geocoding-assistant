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

  validGeo (feat) {
    return isFinite(feat.x) && feat.x && isFinite(feat.y) && feat.y;
  },

  doRequestAsync (url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    //xhr.withCredentials = true;
    xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://adam:8080');

    xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET');
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");


    xhr.onload = (e) => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          return xhr.responseText;
        } else {
          //console.log(xhr.statusText);
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

  wiki (term, next) {
    const path = 'https://en.wikipedia.org/w/api.php?' + 
      'action=query&prop=extracts&callback=?&' + 
      'titles=' +  term + 
      '&format=json';

    $.ajax({
      dataType: 'json',
      url: path,
      async: false, 
      success: (res) => {
        if (res.query && res.query.pages) {
          const pgs = res.query.pages;
          next(pgs[Object.keys(pgs)[0]].extract);
        } else {
          next(false);
        }
      },
      fail: (e) => next(false) 
    })
  },

  geonames (term, next) {
    const path = 'http://api.geonames.org/searchJSON?' + 
      'q=' +  term + 
      '&maxRows=20&username=adammertel';

    $.ajax({
      dataType: 'json',
      url: path,
      async: false, 
      success: (res) => next(res.geonames),
      fail: (e) => next(false)
    })
  }

};

module.exports = Base;