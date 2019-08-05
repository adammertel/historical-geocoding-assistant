import Base from "./base";

var SuggestionSources = [
  {
    id: "geoname",
    url: (term, extent) =>
      "http://api.geonames.org/searchJSON?" +
      "q=" +
      encodeURIComponent(term) +
      "&maxRows=10" +
      "&username=adammertel",
    getRecords: res => res.geonames,
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
    id: "tgaz",
    url: (term, extent) =>
      "http://maps.cga.harvard.edu/tgaz/placename?" +
      "n=" +
      encodeURIComponent(term) +
      "&fmt=json",
    getRecords: res => res.placenames,
    parse: {
      ll: r => {
        const coords = r["xy coordinates"].split(", ");
        return [parseFloat(coords[0]), parseFloat(coords[1])];
      },
      country: r => r.countryCode,
      rank: r => 100,
      name: r => r.transcription,
      url: r => r.uri,
      type: r => r["feature type"],
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
    getRecords: res => res.geonames,
    parse: {
      ll: r => [parseFloat(r.lat), parseFloat(r.lng)],
      country: r => r.countryCode,
      rank: r => r.rank,
      name: r => r.title,
      url: r => r.wikipediaUrl,
      type: r => "",
      info: r => r.summary
    }
  }
];

module.exports = SuggestionSources;
