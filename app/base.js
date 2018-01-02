var Base = {
  doRequestSync(url) {
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

  validGeo(feat) {
    return !!(
      feat &&
      (feat.x || feat[0]) &&
      (feat.y || feat[1]) &&
      (isFinite(feat.x) || isFinite(feat[0])) &&
      (isFinite(feat.y) || isFinite(feat[1]))
    );
  },

  doRequestAsync(url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    //xhr.withCredentials = true;
    xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://adam:8080');

    xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET');
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.onload = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          return xhr.responseText;
        } else {
          //console.log(xhr.statusText);
          return {};
        }
      } else {
        return {};
      }
    };

    xhr.send();
  },

  requestConfigFile(configName, sync, next = false) {
    const configPath = './' + configName;
    if (sync) {
      return JSON.parse(this.doRequestSync(configPath));
    } else {
      this.doRequest(configPath, response => {
        next(JSON.parse(response));
      });
    }
  },

  openTab(path) {
    window.open('https://' + path, '_blank', 'width=800,height=900');
  },

  extentToUrl(e) {
    return (
      'south=' +
      e[0][1] +
      '&north=' +
      e[1][1] +
      '&west=' +
      e[0][0] +
      '&east=' +
      e[1][0]
    );
  },

  wiki(term, noResults = 10, extent, next) {
    const path =
      'http://api.geonames.org/wikipediaSearchJSON?' +
      'q=' +
      encodeURIComponent(term) +
      '&maxRows=10&username=adammertel&' +
      this.extentToUrl(extent);

    $.ajax({
      dataType: 'json',
      url: path,
      async: false,
      processData: false,
      success: res => {
        if (res.geonames) {
          next(this.parseWikis(res.geonames, extent));
        } else {
          next([]);
        }
      },
      fail: () => next([])
    });
  },

  parseWikis(wikis, e) {
    return wikis
      ? wikis
          .map(w => {
            w.ll = [w.lat, w.lng];
            if (this.inExtent(w.ll, e)) {
              return w;
            }
          })
          .filter(w => w)
      : [];
  },

  geonames(term, noResults = 10, extent, next) {
    const path =
      'http://api.geonames.org/searchJSON?' +
      'q=' +
      encodeURIComponent(term) +
      '&maxRows=' +
      noResults +
      '&username=adammertel&' +
      this.extentToUrl(extent);

    $.ajax({
      dataType: 'json',
      processData: false,
      url: path,
      async: false,
      success: res => {
        next(this.parseGeonames(res.geonames, extent));
      },
      fail: () => next([])
    });
  },

  parseGeonames(geonames) {
    return geonames
      ? geonames
          .map(gn => {
            gn.ll = [parseFloat(gn.lat), parseFloat(gn.lng)];
            return gn;
          })
          .filter(g => g)
      : [];
  },

  inExtent(geom, e) {
    if (!this.validGeo(geom) || !e) {
      return true;
    } else if (geom.ll) {
      return (
        e[0][0] < geom.ll[0] &&
        e[1][0] > geom.ll[0] &&
        e[0][1] < geom.ll[1] &&
        e[1][1] > geom.ll[1]
      );
    } else {
      return (
        e[0][0] < geom[0] &&
        e[1][0] > geom[0] &&
        e[0][1] < geom[1] &&
        e[1][1] > geom[1]
      );
    }
  },

  same(value1, value2) {
    return value1.toString() === value2.toString();
  },

  processOverlayData() {
    const overlays = this.requestConfigFile('mapoverlays.json', true);
    Object.keys(overlays).map(okey => {
      const overlay = overlays[okey];
      if (overlay.type === 'geojson') {
        overlay.data = JSON.parse(
          this.doRequestSync('./assets/' + overlay.file)
        );
      }
    });
    return overlays;
  }
};

module.exports = Base;
