import Base from "./base";

/* static */
var data = {};

const links = {
  geonames: "https://secure.geonames.org",
  tgaz: "https://maps.cga.harvard.edu",
  nominatim: "https://nominatim.openstreetmap.org/search",
};

var mapRecord = (recordData, mapObject) => {
  const suggestion = {};
  Object.keys(mapObject).forEach((key) => {
    suggestion[key] = mapObject[key](recordData);
  });
  return suggestion;
};
var mapRecords = (recordsData, mapObject) => {
  return recordsData.map((r) => mapRecord(r, mapObject));
};
var checkNoLimit = (suggestions, no = 10) => {
  return suggestions.length > no ? suggestions.slice(0, no) : suggestions;
};

var _doFetch = (url, opts, sourceNext, next) => {
  Base.doFetch(url, opts, (err, res) => {
    //console.log("fetching", url, res);
    if (err) {
      sourceNext([], err);
    } else if (!res) {
      sourceNext([], true);
    } else {
      next(res);
    }
  });
};

var domparser = new DOMParser();

/*
  getRecords returns ([]records, problem)
*/

const suggestionGeonames = {
  id: "geonames",
  label: "GeoNames",
  urls: {
    base: (term) =>
      links.geonames +
      "/searchJSON?" +
      "q=" +
      encodeURIComponent(term) +
      "&maxRows=10" +
      "&username=dissinet_hga",
  },
  getRecords: (source, term, opts, next) => {
    const url = source.urls.base(term);
    _doFetch(url, {}, next, (res) => {
      if (res.geonames) {
        next(mapRecords(res.geonames, source.recordMap), false);
      } else {
        next([], false);
      }
    });
  },
  recordMap: {
    ll: (r) => [parseFloat(r.lat), parseFloat(r.lng)],
    country: (r) => r.countryCode,
    rank: (r) => 1,
    name: (r) => r.name,
    url: (r) => "",
    type: (r) => r.fcodeName,
    info: (r) => "",
  },
};

const suggestionNominatim = {
  id: "nominatim",
  label: "Nominatim",
  urls: {
    base: (term) =>
      links.nominatim +
      "?format=json&" +
      "q=" +
      encodeURIComponent(term) +
      "&maxRows=10",
  },
  getRecords: (source, term, opts, next) => {
    const url = source.urls.base(term);
    _doFetch(url, {}, next, (res) => {
      if (res) {
        next(mapRecords(res, source.recordMap), false);
      } else {
        next([], false);
      }
    });
  },
  recordMap: {
    ll: (r) => [parseFloat(r.lat), parseFloat(r.lon)],
    country: (r) => "",
    rank: (r) => r.importance,
    name: (r) => r.display_name,
    url: (r) =>
      `https://nominatim.openstreetmap.org/ui/details.html?osmtype=${r.osm_type[0].toUpperCase()}&osmid=${
        r.osm_id
      }`,
    type: (r) => r.type,
    info: (r) => "",
  },
};

const suggestionWiki = {
  id: "wiki",
  label: "Wikipedia",
  urls: {
    base: (term) =>
      links.geonames +
      "/wikipediaSearchJSON?" +
      "q=" +
      encodeURIComponent(term) +
      "&maxRows=10" +
      "&username=dissinet_hga",
  },
  getRecords: (source, term, opts, next) => {
    const url = source.urls.base(term);
    _doFetch(url, {}, next, (res) => {
      if (res.geonames) {
        next(mapRecords(res.geonames, source.recordMap), false);
      } else {
        next([], false);
      }
    });
  },
  recordMap: {
    ll: (r) => [parseFloat(r.lat), parseFloat(r.lng)],
    country: (r) => r.countryCode,
    rank: (r) => r.rank / 100,
    name: (r) => r.title,
    url: (r) => r.wikipediaUrl,
    type: (r) => "",
    info: (r) => r.summary,
  },
};

const suggestionChina = {
  id: "tgaz",
  label: "China Historical GIS",
  urls: {
    base: (term) =>
      links.tgaz +
      "/tgaz/placename?" +
      "n=" +
      encodeURIComponent(term) +
      "&fmt=json",
  },
  getRecords: (source, term, opts, next) => {
    const url = source.urls.base(term);
    _doFetch(url, {}, next, (res) => {
      if (res.placenames) {
        const suggestions = checkNoLimit(res.placenames);
        next(mapRecords(suggestions, source.recordMap), false);
      } else {
        next([], true);
      }
    });
  },
  recordMap: {
    ll: (r) => {
      const coords = r["xy coordinates"].split(", ");
      return [parseFloat(coords[1]), parseFloat(coords[0])];
    },
    country: (r) => "",
    rank: (r) => 1,
    name: (r) => r.transcription,
    url: (r) => r.uri,
    type: (r) => r["feature type"],
    info: (r) => "",
  },
};

const suggestionTGN = {
  id: "getty",
  label: "Getty TGN",
  urls: {
    base: (term) =>
      "http://vocab.getty.edu/resource/getty/search?q=" +
      encodeURIComponent(term) +
      "&luceneIndex=Full&indexDataset=TGN&limit=500",
    record: (id) => "http://vocab.getty.edu/tgn/" + id + "-geometry",
  },

  getRecords: (source, term, opts, next) => {
    const url = source.urls.base(term);
    _doFetch(url, {}, next, (res) => {
      const doc = domparser.parseFromString(res, "text/html");
      const resultNodes = Base.query(doc, "#results table tbody tr");

      let results = [];
      results = resultNodes.map((result) => {
        const tds = Base.query(result, "td").map((t) => t.textContent);

        const id = tds[0].split("tgn:")[1];
        const name = tds[1];
        return {
          id: id,
          sim: Base.simScore(term, name),
          name: name,
          info: tds[3],
          type: tds[4],
        };
      });

      results.sort((a, b) => {
        if (a.sim === b.sim) {
          return a.type.includes("inhabited places") ? -1 : 1;
        } else {
          return a.sim > b.sim ? -1 : 1;
        }
      });
      results = checkNoLimit(results);

      let processed = 0;

      const parsedResults = [];
      const checkNext = () => {
        if (processed === results.length) {
          next(mapRecords(parsedResults, source.recordMap), false);
        }
      };

      checkNext();

      results.forEach((result) => {
        Base.doFetch(source.urls.record(result.id), {}, (err, res) => {
          if (!err) {
            var doc = domparser.parseFromString(res, "text/html");
            const spans = Base.query(doc, "#results td span").map(
              (s) => s.textContent
            );

            result.ll = spans.length > 6 ? [spans[3], spans[6]] : false;
            if (result.ll) {
              parsedResults.push(result);
            }
          }
          processed++;
          checkNext();
        });
      });
    });
  },
  recordMap: {
    ll: (r) => {
      return r.ll &&
        r.ll[0] &&
        r.ll[1] &&
        parseFloat(r.ll[0]) &&
        parseFloat(r.ll[1])
        ? [parseFloat(r.ll[0]), parseFloat(r.ll[1])]
        : false;
    },
    country: (r) => "",
    rank: (r) => r.sim,
    name: (r) => r.name,
    url: (r) => "vocab.getty.edu/tgn/" + r.id,
    type: (r) => r.type,
    info: (r) => r.info,
  },
};

const suggestionPleiades = {
  id: "pleiades",
  label: "Pleiades",
  preload: () => {
    Base.doFetch(
      "https://raw.githubusercontent.com/ryanfb/pleiades-geojson/gh-pages/name_index.json",
      {},
      (err, res) => {
        if (res) {
          data["pleiades"] = res.filter((r) => r[0] && r[0] !== "Untitled");
        }
      }
    );
  },
  urls: {
    record: (id) => {
      return "https://pleiades.stoa.org/places/" + id + "/json";
    },
  },
  getRecords: (source, term, opts, next) => {
    if (!data["pleiades"]) {
      next([], true);
    }

    let similars = [];

    if (data["pleiades"]) {
      data["pleiades"].forEach((p) => {
        const name = p[0];
        const id = p[1];
        const simScore = Base.simScore(term, name);
        if (simScore > 0.65) {
          similars.push({
            id: id,
            name: name,
            sim: simScore,
          });
        }
      });
    } else {
      data["pleiades"] = [];
    }

    similars.sort((a, b) => (a.sim > b.sim ? -1 : 1));
    similars = checkNoLimit(similars);
    const all = similars.length;
    let processed = 0;
    const suggestions = [];

    const checkFinished = () => {
      if (processed === all) {
        next(mapRecords(suggestions, source.recordMap), false);
      }
    };

    // in case there are no suggestions
    checkFinished();

    similars.forEach((similar) => {
      const id = similar.id;
      const url = source.urls.record(id);
      Base.doFetch(url, {}, (err, res) => {
        processed++;
        if (!err && res.reprPoint) {
          res.sim = similar.sim;
          suggestions.push(res);
        }
        checkFinished();
      });
    });
  },
  recordMap: {
    ll: (r) => {
      if (r.reprPoint && r.reprPoint.length === 2) {
        return [r.reprPoint[1], r.reprPoint[0]];
      } else {
        return false;
      }
    },
    country: (r) => "",
    rank: (r) => r.sim,
    name: (r) => r.title,
    url: (r) => r.uri,
    type: (r) => r.placeTypes.join(),
    info: (r) => r.description,
  },
};

var SuggestionSources = [
  suggestionGeonames,
  suggestionWiki,
  // suggestionTGN,
  suggestionNominatim,
  suggestionPleiades,
  suggestionChina,
];
module.exports = SuggestionSources;
