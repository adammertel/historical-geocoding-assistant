// @flow
import $ from 'jquery';
import fetchJsonp from 'fetch-jsonp';

var Base = {
  doRequest(url, next) {
    const req = new XMLHttpRequest();
    req.open('GET', 'app/' + url, true); // `false` makes the request synchronous
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

  requestConfigFile(configPath, next) {
    this.doRequest('configs/' + configPath, data => next(data));
  },

  openTab(path) {
    window.open('http://' + path, '_blank', 'width=800,height=900');
  },

  extentToUrl(e, type = 'wiki') {
    if (type === 'wiki') {
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
    }
  },

  wiki(term, extent, next) {
    const path =
      'http://api.geonames.org/wikipediaSearchJSON?' +
      'q=' +
      encodeURIComponent(term) +
      '&maxRows=10&username=adammertel&' +
      this.extentToUrl(extent);

    $.ajax({
      dataType: 'json',
      url: path,
      async: true,
      processData: false,
      success: res => {
        next(res.geonames ? this.parseGeonames(res.geonames, extent) : []);
      },
      fail: () => next([])
    });
  },

  geonames(term, extent, next) {
    const path =
      'http://api.geonames.org/searchJSON?' +
      'q=' +
      encodeURIComponent(term) +
      '&maxRows=10' +
      '&username=adammertel';

    $.ajax({
      dataType: 'json',
      processData: false,
      url: path,
      async: true,
      success: res => {
        next(res.geonames ? this.parseGeonames(res.geonames, extent) : []);
      },
      fail: () => next([])
    });
  },

  parseGeonames(geonames, e) {
    return geonames
      .map(gn => {
        gn.ll = [parseFloat(gn.lat), parseFloat(gn.lng)];
        return this.inExtent(gn.ll, e) ? gn : false;
      })
      .filter(g => g);
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
