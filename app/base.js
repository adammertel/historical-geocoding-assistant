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
    return !!(feat && (feat.x || feat[0]) && (feat.y || feat[1]) && 
      (isFinite(feat.x) || isFinite(feat[0])) && (isFinite(feat.y) || isFinite(feat[1])));
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

  openTab (path) {
    window.open(
      'https://' + path,
      '_blank',
      'width=800,height=900'
    );
  },

  wiki (term, next) {
    const path = 'http://api.geonames.org/wikipediaSearchJSON?' + 
    'q=' + term + '&maxRows=10&username=adammertel'

    $.ajax({
      dataType: 'json',
      url: path,
      async: false, 
      success: (res) => {
        if (res.geonames) {
          next(this.parseWikis(res.geonames));
        } else {
          next([]);
        }
      },
      fail: (e) => next([]) 
    })
    
    /* const path = 'https://en.wikipedia.org/w/api.php?' + 
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
    }) */
  },

  parseWikis (wikis) {
    return wikis.map(w => {
      w.ll = [w.lat, w.lng]
      return w
    })
  },

  geonames (term, noResults, extent, next) {
    const path = 'http://api.geonames.org/searchJSON?' + 
      'q=' +  term + 
      '&maxRows=' + noResults + '&username=adammertel&fuzzy=0.6';

    $.ajax({
      dataType: 'json',
      url: path,
      async: false, 
      success: (res) => {
        next(this.parseGeonames(res.geonames, extent))
      },
      fail: (e) => next([])
    })
  },

  parseGeonames (geonames, e) {
    return geonames.map(gn => {
      gn.ll = [parseFloat(gn.lat), parseFloat(gn.lng)];
      
      if (this.inExtent(gn, e)) {
        return gn
      }
    })
  },

  inExtent (geom, e) {
    if (!this.validGeo(geom) || !e) {
      return true;
    } else if (geom.ll) {
      return (
        e[0][0] < geom.ll[0] && 
        e[1][0] > geom.ll[0] && 
        e[0][1] < geom.ll[1] && 
        e[1][1] > geom.ll[1]
      )
    } else {
      return (
        e[0][0] < geom[0] && 
        e[1][0] > geom[0] && 
        e[0][1] < geom[1] && 
        e[1][1] > geom[1]
      )
    }
  },

  processOverlayData () {
    const overlays = this.requestConfigFile('mapoverlays.json', true);
    Object.keys(overlays).map( okey => {
      const overlay = overlays[okey];
      if (overlay.type === 'geojson') {
        overlay.data = JSON.parse(this.doRequestSync('./assets/' + overlay.file));
      }
    })
    return overlays;
  }

};

module.exports = Base;