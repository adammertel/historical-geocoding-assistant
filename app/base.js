// @flow
import $ from "jquery";
import { divIcon } from "leaflet";
import stringSimilarity from "string-similarity";

var Base = {
  getSuggestions(source, recordName, extent, next) {
    fetch(source.url(recordName, extent), {
      mode: "cors"
    })
      .then(response => {
        return response.text();
      })
      .then(body => {
        const parsedBody = Base.isJsonString(body) ? JSON.parse(body) : body;
        source.getRecords(parsedBody, res => {
          const parsedRecords = res.map(rec => {
            const suggestion = {};
            Object.keys(source.parse).forEach(key => {
              suggestion[key] = source.parse[key](rec);
            });
            return suggestion;
          });
          next(parsedRecords);
        });
      });

    /*
    $.ajax({
      url: source.url(recordName, extent),
      async: true,
      processData: false,
      success: data => {
        source.getRecords(data, res => {
          const parsedRecords = res.map(rec => {
            const suggestion = {};
            Object.keys(source.parse).forEach(key => {
              suggestion[key] = source.parse[key](rec);
            });
            return suggestion;
          });
          next(parsedRecords);
        });
      },
      fail: e => {
        next([]);
      }
    });
    */
  },

  doRequest(url, next) {
    const req = new XMLHttpRequest();
    req.open("GET", url, true); // `false` makes the request synchronous
    req.withCredentials = false;
    req.send();

    const success = out => {
      next(JSON.parse(out.responseText));
    };
    const error = status => {
      console.log("err", status);
      next(false);
    };
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        return req.status === 200 ? success(req) : error(req.status);
      }
    };
  },

  validGeo(f) {
    if (f && (f[0] || f[0] === 0) && (f[1] || f[1] === 0)) {
      if (isFinite(f[0]) && isFinite(f[1])) {
        return true;
      }
    }
    return false;
  },

  icon(classes, style, size, anchor = false) {
    return divIcon({
      html:
        '<span style="' +
        style +
        '; vertical-align: bottom"' +
        ' class="icon"><i style="font-size:' +
        size[0] +
        'px" class="' +
        classes +
        '"></i></span>',
      className: "map-sort-icon",
      iconAnchor: anchor ? anchor : [size[0] / 2, size[1]],
      iconSize: size
    });
  },

  requestConfigFile(configPath, next) {
    this.doRequest("./configs/" + configPath, data => next(data));
  },

  requestDataFile(configPath, next) {
    this.doRequest("./data/" + configPath, data => next(data));
  },

  openTab(path) {
    const url = path.includes("http://") ? path : "http://" + path;
    window.open(url, "_blank", "width=800,height=900");
  },

  extentToUrl(e, type = "wiki") {
    if (type === "wiki") {
      return (
        "south=" +
        e[0][1] +
        "&north=" +
        e[1][1] +
        "&west=" +
        e[0][0] +
        "&east=" +
        e[1][0]
      );
    }
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

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },

  /* 
    ling similarity
  */
  simScore(w1, w2) {
    return stringSimilarity.compareTwoStrings(w1, w2);
  },

  simScoreMax(w1, ws) {
    return ws.length ? Math.max(...ws.map(o => this.simScore(w1, o))) : 0;
  },

  simScoreBi(w1, positives, negatives) {
    const scorePositive = Base.simScoreMax(w1, positives);
    const scoreNegative = Base.simScoreMax(w1, negatives);
    return scorePositive - scoreNegative;
  },

  sanitizeWord(w) {
    return w
      .toLowerCase()
      .trim()
      .replace(/_/g, "")
      .replace(/-/g, "");
  }
};

module.exports = Base;
