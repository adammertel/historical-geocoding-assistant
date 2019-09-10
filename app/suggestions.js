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
var checkNoLimit = suggestions => {
  return suggestions.length > 10 ? suggestions.slice(0, 10) : suggestions;
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
          next([], true);
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
          next([], true);
        }
      });
      next([], true);
    },
    recordMap: {
      ll: r => [parseFloat(r.lat), parseFloat(r.lng)],
      country: r => r.countryCode,
      rank: r => r.rank,
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
      rank: r => 100,
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
        "&luceneIndex=Full&indexDataset=TGN&_form=%2Fresource%2Fgetty%2Fsearch",
      record: id => "http://vocab.getty.edu/tgn/" + id + "-geometry"
    },

    getRecords: (source, term, opts, next) => {
      const url = source.urls.base(term);
      _doFetch(url, {}, next, res => {
        const doc = domparser.parseFromString(res, "text/html");
        const resultNodes = $(doc)
          .find("#results table tbody tr")
          .toArray();

        const results = checkNoLimit(
          resultNodes.map(result => {
            const tds = $(result)
              .find("td")
              .toArray()
              .map(t => $(t).text());
            const id = tds[0].split("tgn:")[1];
            return {
              id: id,
              name: tds[1],
              info: tds[3],
              type: tds[4]
            };
          })
        );

        const allResults = results.length;
        let processed = 0;

        const checkNext = () => {
          if (processed === allResults) {
            next(mapRecords(results, source.recordMap), false);
          }
        };

        checkNext();

        results.forEach(result => {
          Base.doFetch(source.urls.record(result.id), {}, (err, res) => {
            if (err) {
              result.ll = false;
              processed++;
              checkNext();
            }
            var doc = domparser.parseFromString(res, "text/html");
            const spans = $(doc)
              .find("#results td span")
              .toArray()
              .map(s => $(s).text());

            result.ll = spans.length > 6 ? [spans[3], spans[6]] : false;

            processed++;
            checkNext();
          });
        });
      });
    },
    recordMap: {
      ll: r => (r.ll ? [parseFloat(r.ll[0]), parseFloat(r.ll[1])] : false),
      country: r => "",
      rank: r => 100,
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
      data["pleiades"] = [
        ["tianbian", "423025"],
        ["tianbian", "423026"],
        ["sth else", "423027"]
      ];
    },
    urls: {
      record: id => {
        return "http://pleiades.stoa.org/places/" + id + "/json";
      }
    },
    getRecords: (source, term, opts, next) => {
      console.log(term);
      console.log(data["pleiades"]);

      const ids = checkNoLimit(
        data["pleiades"].filter(p => p[0] === term).map(r => r[1])
      );

      const all = ids.length;
      let processed = 0;
      const suggestions = [];

      const checkNext = () => {
        console.log("checking next", suggestions);
        if (processed === all) {
          next(mapRecords(suggestions, source.recordMap), false);
        }
      };
      checkNext();

      ids.forEach(id => {
        const url = source.urls.record(id);
        Base.doFetch(url, {}, (err, res) => {
          processed++;
          if (!err) {
            suggestions.push(res);
          }
          checkNext();
        });
      });
    },
    recordMap: {
      ll: r => [r.reprPoint[1], r.reprPoint[0]],
      country: r => "",
      rank: r => 100,
      name: r => r.title,
      url: r => r.uri,
      type: r => r.placeTypes.join(),
      info: r => r.description
    }
  }
];

module.exports = SuggestionSources;
