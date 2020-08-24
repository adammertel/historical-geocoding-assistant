import * as L from "leaflet";
import queryString from "query-string";

var Base = {
  /**
   * {err, json-body}
   */
  doFetch(url, params = {}, next) {
    console.log(url);
    if (url) {
      fetch(url, {
        mode: "cors",
      })
        .then((response) => {
          return response.text();
        })
        .then((body) => {
          const parsedBody = Base.isJsonString(body) ? JSON.parse(body) : body;
          next(false, parsedBody);
        })
        .catch((error) => {
          console.log(error);
          next(error, false);
        });
    }
  },

  /**
   * deprecated
   */
  doRequest(url, next) {
    const req = new XMLHttpRequest();
    req.open("GET", url, true); // `false` makes the request synchronous
    req.withCredentials = false;
    req.send();

    const success = (out) => {
      next(JSON.parse(out.responseText));
    };
    const error = (status) => {
      console.log("err", status);
      next(false);
    };
    req.onreadystatechange = function () {
      if (req.readyState == 4) {
        return req.status === 200 ? success(req) : error(req.status);
      }
    };
  },

  /**
   * returns a list of elements based on given selectors
   */
  query(context, selectors) {
    const els = context.querySelectorAll(selectors);
    if (els) {
      return Array.from(els);
    }
    return [];
  },

  /**
   * checks whether the given feature has a valid geometry
   */
  validGeo(feature) {
    if (
      feature &&
      (feature[0] || feature[0] === 0) &&
      (feature[1] || feature[1] === 0)
    ) {
      if (isFinite(feature[0]) && isFinite(feature[1])) {
        return true;
      }
    }
    return false;
  },

  /**
   * returns a standardized Leaflet divIcon
   */
  icon(classes, style, size, anchor = false) {
    return L.divIcon({
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
      iconSize: size,
    });
  },

  requestConfigFile(configPath, next) {
    this.doFetch("./configs/" + configPath, {}, (err, data) => next(data));
  },

  requestDataFile(configPath, next) {
    this.doFetch("./data/" + configPath, {}, (err, data) => next(data));
  },

  /**
   * opens url on a new tab
   */
  openTab(path) {
    const url =
      path.includes("http://") || path.includes("https://")
        ? path
        : "http://" + path;
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

  /**
   * check whether the given geometry is in the extent
   */
  inExtent(geom, extent) {
    if (!this.validGeo(geom) || !extent) {
      return true;
    } else if (geom.ll) {
      return (
        extent[0][0] < geom.ll[0] &&
        extent[1][0] > geom.ll[0] &&
        extent[0][1] < geom.ll[1] &&
        extent[1][1] > geom.ll[1]
      );
    } else {
      return (
        extent[0][0] < geom[0] &&
        extent[1][0] > geom[0] &&
        extent[0][1] < geom[1] &&
        extent[1][1] > geom[1]
      );
    }
  },

  shortenText(textToShorten, numberOfCharacters = 10) {
    if (textToShorten.length > numberOfCharacters) {
      return textToShorten.substr(0, numberOfCharacters) + "...";
    } else {
      return textToShorten;
    }
  },

  /**
   * checks whether the value 1 is the same as the value 2
   */
  same(value1, value2) {
    return value1.toString() === value2.toString();
  },

  /**
   * tries to parse the given string to JSON and returns false if it is not possible
   */
  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },

  /**
   * distance between two ll points in kilometers
   */
  geoDistance(ll1, ll2) {
    try {
      return L.latLng(ll1).distanceTo(L.latLng(ll2)) / 1000;
    } catch (e) {
      return 0;
    }
  },

  /* 
    ling similarity
  */
  simAlgorithms: {
    levenshtein: (a, b) => {
      // https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/string/levenshtein-distance/levenshteinDistance.js
      const al = a.length;
      const bl = b.length;
      const distanceMatrix = Array(bl + 1)
        .fill(null)
        .map(() => Array(al + 1).fill(null));
      for (let i = 0; i <= al; i += 1) {
        distanceMatrix[0][i] = i;
      }
      for (let j = 0; j <= bl; j += 1) {
        distanceMatrix[j][0] = j;
      }
      for (let j = 1; j <= bl; j += 1) {
        for (let i = 1; i <= al; i += 1) {
          const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
          distanceMatrix[j][i] = Math.min(
            distanceMatrix[j][i - 1] + 1, // deletion
            distanceMatrix[j - 1][i] + 1, // insertion
            distanceMatrix[j - 1][i - 1] + indicator // substitution
          );
        }
      }
      return 1 - distanceMatrix[bl][al] / (al > bl ? al : bl);
    },
    sub: (a, b) => {
      if (a.includes(b) || b.includes(a)) {
        return 1;
      } else {
        const s1 = a.length <= b.length ? a : b;
        const s2 = a.length <= b.length ? b : a;
        for (var i = s1.length - 1; i > 2; i--) {
          const ss = s1.substr(0, i);
          if (s2.includes(ss)) {
            return i / s1.length;
          }
        }
        return 0;
      }
    },
  },

  // TODO: needs something more inteligent
  simScore(s1, s2) {
    const a = s1.toLowerCase();
    const b = s2.toLowerCase();
    const al = a.length;
    const bl = b.length;
    const limit = Math.floor(al / 2) + 3;
    if (bl > 6 && al > 4 && bl - al > limit) {
      return Base.simAlgorithms.sub(a, b);
    } else {
      const match3 = a.substr(0, 3) === b.substr(0, 3);
      const score = Base.simAlgorithms.levenshtein(a, b);
      return match3 ? Math.sqrt(score, 2) : score;
    }
  },

  simScoreMax(w1, ws) {
    return ws.length ? Math.max(...ws.map((o) => this.simScore(w1, o))) : 0;
  },

  simScoreBi(w1, positives, negatives) {
    const scorePositive = Base.simScoreMax(w1, positives);
    const scoreNegative = Base.simScoreMax(w1, negatives);
    return scorePositive - scoreNegative;
  },

  sanitizeWord(w) {
    return w.toLowerCase().trim().replace(/_/g, "").replace(/-/g, "");
  },

  // split given text into parts based on the charToSplit and return the last part
  // examples:
  //  - getLastPart('hello world', ' ') -> 'world'
  //  - getLastPart('/a/b/c/d', '/') -> 'd'
  getLastPart(text, charToSplit) {
    if (text && text.includes(charToSplit)) {
      const parts = text.split(charToSplit);
      return parts[parts.length - 1];
    }
    return false;
  },

  checkValidSpreadsheetUrl(url) {
    if (url) {
      if (url.includes("spreadsheet")) {
        if (url.includes("docs.google")) {
          if (url.includes("/d/")) {
            if (Base.parseSheetUrl(url)["spreadsheetId"]) {
              return true;
            }
          }
        }
      }
    }
    return false;
  },

  parseSheetFromHash() {
    const hash = queryString.parse(location.hash);
    if (hash.did) {
      return hash;
    } else {
      return false;
    }
  },

  validHash() {
    return !!this.parseSheetFromHash();
  },

  parseSheetUrl(url) {
    const regExSpreadsheetId = new RegExp(
      "/spreadsheets/d/([a-zA-Z0-9-_]+)",
      "g"
    );
    const regExSheetId = new RegExp("[#&]gid=([0-9]+)", "g");
    const spreadsheetIdUrl = url.match(regExSpreadsheetId);
    const sheetIdUrl = url.match(regExSheetId);

    return {
      spreadsheetId: Base.getLastPart(spreadsheetIdUrl[0], "/"),
      sheetid: sheetIdUrl ? Base.getLastPart(sheetIdUrl[0], "=") : false,
    };
  },
};

module.exports = Base;
