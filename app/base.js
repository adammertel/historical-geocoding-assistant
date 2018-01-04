var Base = {
  doRequest(url, next) {
    const req = new XMLHttpRequest();
    req.open('GET', url, true); // `false` makes the request synchronous
    req.withCredentials = false;
    req.send();

    const success = out => {
      next(JSON.parse(out.responseText));
    };
    const error = status => {
      next(false);
    };
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        return req.status === 200 ? success(req) : error(req.status);
      }
    };
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

  requestConfigFile(configName, next) {
    const configPath = './' + configName;
    this.doRequest(configPath, data => next(data));
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
  }
};

module.exports = Base;
