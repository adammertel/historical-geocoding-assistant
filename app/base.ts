import * as L from "leaflet";
import queryString from "query-string";
import { LatLng, GeoExtent } from "./types";

interface SimAlgorithms {
  levenshtein: (a: string, b: string) => number;
  sub: (a: string, b: string) => number;
}

interface SheetUrlResult {
  spreadsheetId: string;
  sheetid: string | false;
}

const Base = {
  /**
   * {err, json-body}
   */
  doFetch(
    url: string,
    params: Record<string, any> = {},
    next: (err: Error | false, data: any) => void
  ): void {
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
  doRequest(url: string, next: (data: any) => void): void {
    const req = new XMLHttpRequest();
    req.open("GET", url, true); // `false` makes the request synchronous
    req.withCredentials = false;
    req.send();

    const success = (out: XMLHttpRequest) => {
      next(JSON.parse(out.responseText));
    };
    const error = (status: number) => {
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
  query(context: Document | Element, selectors: string): Element[] {
    const els = context.querySelectorAll(selectors);
    if (els) {
      return Array.from(els);
    }
    return [];
  },

  /**
   * checks whether the given feature has a valid geometry
   */
  validGeo(feature: LatLng | null | undefined): boolean {
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
  icon(
    classes: string,
    style: string,
    size: [number, number],
    anchor: [number, number] | false = false
  ): L.DivIcon {
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

  requestConfigFile(configPath: string, next: (data: any) => void): void {
    this.doFetch("/configs/" + configPath, {}, (err, data) => next(data));
  },

  requestDataFile(configPath: string, next: (data: any) => void): void {
    this.doFetch("/data/" + configPath, {}, (err, data) => next(data));
  },

  /**
   * opens url on a new tab
   */
  openTab(path: string): void {
    const url =
      path.includes("http://") || path.includes("https://")
        ? path
        : "http://" + path;
    window.open(url, "_blank", "width=800,height=900");
  },

  extentToUrl(e: GeoExtent, type: string = "wiki"): string {
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
    return "";
  },

  /**
   * check whether the given geometry is in the extent
   */
  inExtent(
    geom: LatLng | { ll: LatLng },
    extent: GeoExtent | null | undefined
  ): boolean {
    if (!this.validGeo("ll" in geom ? geom.ll : geom) || !extent) {
      return true;
    } else if ("ll" in geom) {
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

  shortenText(textToShorten: string, numberOfCharacters: number = 10): string {
    if (textToShorten.length > numberOfCharacters) {
      return textToShorten.substr(0, numberOfCharacters) + "...";
    } else {
      return textToShorten;
    }
  },

  /**
   * checks whether the value 1 is the same as the value 2
   */
  same(value1: any, value2: any): boolean {
    return value1.toString() === value2.toString();
  },

  /**
   * tries to parse the given string to JSON and returns false if it is not possible
   */
  isJsonString(str: string): boolean {
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
  geoDistance(ll1: LatLng, ll2: LatLng): number {
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
    levenshtein: (a: string, b: string): number => {
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
    sub: (a: string, b: string): number => {
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
  } as SimAlgorithms,

  // TODO: needs something more inteligent
  simScore(s1: string, s2: string): number {
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
      return match3 ? Math.sqrt(score) : score;
    }
  },

  simScoreMax(w1: string, ws: string[]): number {
    return ws.length ? Math.max(...ws.map((o) => this.simScore(w1, o))) : 0;
  },

  simScoreBi(w1: string, positives: string[], negatives: string[]): number {
    const scorePositive = Base.simScoreMax(w1, positives);
    const scoreNegative = Base.simScoreMax(w1, negatives);
    return scorePositive - scoreNegative;
  },

  sanitizeWord(w: string): string {
    return w.toLowerCase().trim().replace(/_/g, "").replace(/-/g, "");
  },

  // split given text into parts based on the charToSplit and return the last part
  // examples:
  //  - getLastPart('hello world', ' ') -> 'world'
  //  - getLastPart('/a/b/c/d', '/') -> 'd'
  getLastPart(text: string, charToSplit: string): string | false {
    if (text && text.includes(charToSplit)) {
      const parts = text.split(charToSplit);
      return parts[parts.length - 1];
    }
    return false;
  },

  checkValidSpreadsheetUrl(url: string): boolean {
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

  parseSheetFromHash(): Record<string, string> | false {
    const hash = queryString.parse(location.hash);
    if (hash.did) {
      return hash as Record<string, string>;
    } else {
      return false;
    }
  },

  validHash(): boolean {
    return !!this.parseSheetFromHash();
  },

  parseSheetUrl(url: string): SheetUrlResult {
    const regExSpreadsheetId = new RegExp(
      "/spreadsheets/d/([a-zA-Z0-9-_]+)",
      "g"
    );
    const regExSheetId = new RegExp("[#&]gid=([0-9]+)", "g");
    const spreadsheetIdUrl = url.match(regExSpreadsheetId);
    const sheetIdUrl = url.match(regExSheetId);

    return {
      spreadsheetId: spreadsheetIdUrl
        ? (Base.getLastPart(spreadsheetIdUrl[0], "/") as string)
        : "",
      sheetid: sheetIdUrl ? Base.getLastPart(sheetIdUrl[0], "=") : false,
    };
  },
};

export default Base;
