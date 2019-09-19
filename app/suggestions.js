import Base from "./base";
import $ from "jquery";

/* static */
var data = {};
var mapRecord = (recordData, mapObject) => {
  const suggestion = {};
  Object.keys(mapObject).forEach(key => {
    suggestion[key] = mapObject[key](recordData);
  });
  return suggestion;
};
var mapRecords = (recordsData, mapObject) => {
  return recordsData.map(r => mapRecord(r, mapObject));
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
var SuggestionSources = [
  {
    id: "geonames",
    label: "GeoNames",
    urls: {
      base: term =>
        "http://api.geonames.org/searchJSON?" +
        "q=" +
        encodeURIComponent(term) +
        "&maxRows=10" +
        "&username=adammertel"
    },
    getRecords: (source, term, opts, next) => {
      const url = source.urls.base(term);
      _doFetch(url, {}, next, res => {
        if (res.geonames) {
          next(mapRecords(res.geonames, source.recordMap), false);
        } else {
          next([], false);
        }
      });
    },
    recordMap: {
      ll: r => [parseFloat(r.lat), parseFloat(r.lng)],
      country: r => r.countryCode,
      rank: r => 100,
      name: r => r.name,
      url: r => "",
      type: r => r.fcodeName,
      info: r => ""
    }
  },
  {
    id: "wiki",
    label: "Wikipedia",
    urls: {
      base: term =>
        "http://api.geonames.org/wikipediaSearchJSON?" +
        "q=" +
        encodeURIComponent(term) +
        "&maxRows=10" +
        "&username=adammertel&"
    },
    getRecords: (source, term, opts, next) => {
      const url = source.urls.base(term);
      _doFetch(url, {}, next, res => {
        if (res.geonames) {
          next(mapRecords(res.geonames, source.recordMap), false);
        } else {
          next([], false);
        }
      });
    },
    recordMap: {
      ll: r => [parseFloat(r.lat), parseFloat(r.lng)],
      country: r => r.countryCode,
      rank: r => r.rank / 100,
      name: r => r.title,
      url: r => r.wikipediaUrl,
      type: r => "",
      info: r => r.summary
    }
  },
  {
    id: "tgaz",
    label: "China Historical GIS",
    urls: {
      base: term =>
        "http://maps.cga.harvard.edu/tgaz/placename?" +
        "n=" +
        encodeURIComponent(term) +
        "&fmt=json"
    },
    getRecords: (source, term, opts, next) => {
      const url = source.urls.base(term);
      _doFetch(url, {}, next, res => {
        if (res.placenames) {
          const suggestions = checkNoLimit(res.placenames);
          next(mapRecords(suggestions, source.recordMap), false);
        } else {
          next([], true);
        }
      });
    },
    recordMap: {
      ll: r => {
        const coords = r["xy coordinates"].split(", ");
        return [parseFloat(coords[1]), parseFloat(coords[0])];
      },
      country: r => "",
      rank: r => 1,
      name: r => r.transcription,
      url: r => r.uri,
      type: r => r["feature type"],
      info: r => ""
    }
  },
  {
    id: "getty",
    label: "Getty TGN",
    urls: {
      base: term =>
        "http://vocab.getty.edu/resource/getty/search?q=" +
        encodeURIComponent(term) +
        "&luceneIndex=Full&indexDataset=TGN&limit=500",
      record: id => "http://vocab.getty.edu/tgn/" + id + "-geometry"
    },

    getRecords: (source, term, opts, next) => {
      const url = source.urls.base(term);
      _doFetch(url, {}, next, res => {
        const doc = domparser.parseFromString(res, "text/html");
        const resultNodes = $(doc)
          .find("#results table tbody tr")
          .toArray();

        let results = [];
        results = resultNodes.map(result => {
          const tds = $(result)
            .find("td")
            .toArray()
            .map(t => $(t).text());
          const id = tds[0].split("tgn:")[1];
          const name = tds[1];
          return {
            id: id,
            sim: Base.simScore(term, name),
            name: name,
            info: tds[3],
            type: tds[4]
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

        results.forEach(result => {
          Base.doFetch(source.urls.record(result.id), {}, (err, res) => {
            if (!err) {
              var doc = domparser.parseFromString(res, "text/html");
              const spans = $(doc)
                .find("#results td span")
                .toArray()
                .map(s => $(s).text());

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
      ll: r => {
        return r.ll &&
          r.ll[0] &&
          r.ll[1] &&
          parseFloat(r.ll[0]) &&
          parseFloat(r.ll[1])
          ? [parseFloat(r.ll[0]), parseFloat(r.ll[1])]
          : false;
      },
      country: r => "",
      rank: r => r.sim,
      name: r => r.name,
      url: r => "http://vocab.getty.edu/tgn/" + r.id,
      type: r => r.type,
      info: r => r.info
    }
  },
  {
    id: "pleiades",
    label: "Pleiades",
    preload: () => {
      Base.doFetch(
        "https://raw.githubusercontent.com/ryanfb/pleiades-geojson/gh-pages/name_index.json",
        {},
        (err, res) => {
          data["pleiades"] = res.filter(r => r[0] && r[0] !== "Untitled");
        }
      );
    },
    urls: {
      record: id => {
        return "http://pleiades.stoa.org/places/" + id + "/json";
      }
    },
    getRecords: (source, term, opts, next) => {
      if (!data["pleiades"]) {
        next([], true);
      }

      let similars = [];

      data["pleiades"].forEach(p => {
        const name = p[0];
        const id = p[1];
        const simScore = Base.simScore(term, name);
        if (simScore > 0.65) {
          similars.push({
            id: id,
            name: name,
            sim: simScore
          });
        }
      });

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

      similars.forEach(similar => {
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
      ll: r => {
        if (r.reprPoint && r.reprPoint.length === 2) {
          return [r.reprPoint[1], r.reprPoint[0]];
        } else {
          return false;
        }
      },
      country: r => "",
      rank: r => r.sim,
      name: r => r.title,
      url: r => r.uri,
      type: r => r.placeTypes.join(),
      info: r => r.description
    }
  }
];

module.exports = SuggestionSources;
