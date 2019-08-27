import Base from "./base";
import $ from "jquery";

var SuggestionSources = [
  {
    id: "geoname",
    url: (term, extent) =>
      "http://api.geonames.org/searchJSON?" +
      "q=" +
      encodeURIComponent(term) +
      "&maxRows=10" +
      "&username=adammertel",
    getRecords: (res, next) => {
      next(res.geonames);
    },
    parse: {
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
    url: (term, extent) =>
      "http://api.geonames.org/wikipediaSearchJSON?" +
      "q=" +
      encodeURIComponent(term) +
      "&maxRows=10" +
      "&username=adammertel&" +
      Base.extentToUrl(extent),
    getRecords: (res, next) => next(res.geonames),
    parse: {
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
    url: (term, extent) =>
      "http://maps.cga.harvard.edu/tgaz/placename?" +
      "n=" +
      encodeURIComponent(term) +
      "&fmt=json",
    getRecords: (res, next) => next(res.placenames),
    parse: {
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
    url: (term, extent) =>
      "http://vocab.getty.edu/resource/getty/search?q=" +
      encodeURIComponent(term) +
      "&luceneIndex=Full&indexDataset=TGN&_form=%2Fresource%2Fgetty%2Fsearch",
    getRecords: (res, next) => {
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(res, "text/html");
      const resultNodes = $(doc)
        .find("#results table tbody tr")
        .toArray();

      let results = resultNodes.map(result => {
        const tds = $(result)
          .find("td")
          .toArray();
        const id = $(tds[0])
          .text()
          .split("tgn:")[1];
        return {
          id: id,
          url: "http://vocab.getty.edu/tgn/" + id,
          name: $(tds[1]).text(),
          info: $(tds[3]).text(),
          type: $(tds[4]).text()
        };
      });
      //console.log(ids);

      if (results.length > 10) {
        results = results.slice(0, 10);
      }
      const allResults = results.length;
      let processed = 0;
      const checkNext = () => {
        if (processed === allResults) {
          next(results);
        }
      };

      results.map(result => {
        //console.log("http://vocab.getty.edu/tgn/" + id);
        $.get("http://vocab.getty.edu/tgn/" + result.id + "-geometry").then(
          res => {
            var doc = domparser.parseFromString(res, "text/html");
            const spans = $(doc)
              .find("#results td span")
              .toArray();
            let lat = false;
            let lng = false;

            spans.forEach((span, si) => {
              if (
                $(span)
                  .text()
                  .includes("schema:latitude")
              ) {
                lat = $(spans[si + 1]).text();
              }
              if (
                $(span)
                  .text()
                  .includes("schema:longitude")
              ) {
                lng = $(spans[si + 1]).text();
              }
              result.ll = [parseFloat(lat), parseFloat(lng)];
              processed++;
              checkNext();
            });
          }
        );
      });
    },
    parse: {
      ll: r => r.ll,
      country: r => "",
      rank: r => 100,
      name: r => r.name,
      url: r => r.url,
      type: r => r.type,
      info: r => r.info
    }
  }
];
/*
  http://vocab.getty.edu/tgn/7006465
  http://vocabsservices.getty.edu/TGNService.asmx/TGNGetTermMatch?name=pressburg&placetypeid=&nationid=
  http://vocabsservices.getty.edu/TGNService.asmx/TGNGetSubject?subjectID=7006465
  http://www.getty.edu/vow/TGNServlet?english=Y&find=Abu%C5%9F%C3%ADr&place=&page=1&nation=
 */

module.exports = SuggestionSources;
