import { createRoot } from "react-dom/client";

import AppStore from "@/appstore";
import Base from "@/base";
import App from "@/components/App";
import Sheet from "@/sheet";
import SuggestionSources from "@/suggestions";

// Import styles in correct order - globals.css with Tailwind should come first
import "./styles/globals.css";
import "./main.scss";

import "leaflet/dist/leaflet.css";

// Get package version or fallback
const version = "1.6.0a";

const TESTING = false;
console.log("testing mode", TESTING);

(window as any).version = version;

// global variables
(window as any).map = false;
(window as any).Base = Base;
(window as any).SuggestionSources = SuggestionSources as any[];
(SuggestionSources as any[]).forEach((s: any) => {
  if (s.preload) {
    s.preload();
  }
});

(window as any).username = "";

/**
 * testing simscores
 */

/*
const simScoreTests = [
  {
    reference: "coordinatex",
    p: ["coordinatex", "x"],
    n: ["y", "coordinatey"],
  },
];

simScoreTests.forEach((t) => {
  const score = Base.simScoreBi(t.reference, t.p, t.n);
  console.log(t.reference, ";", t.p, t.n, ";", score);
});
*/

// load map layers
Base.requestConfigFile(
  "basemaps.json",
  (data: any) => ((window as any).basemaps = data)
);
Base.requestConfigFile("mapoverlays.json", (overlays: any) => {
  (window as any).overlaymaps = overlays;
  Object.keys(overlays).map((okey) => {
    const overlay = overlays[okey];
    if (overlays[okey].type === "geojson") {
      Base.requestDataFile(
        overlay.file,
        (ovd: any) => (overlays[okey].data = ovd)
      );
    }
  });
});

(window as any).store = new AppStore();

// assigning config. If TESTING === true, config will be extended with config_testing.json
const loadConfig = (next: (config: any) => void) => {
  (window as any).store.changeLoadingStatus("config");
  const configPath = TESTING ? "config_testing.json" : "config.json";
  Base.requestConfigFile(configPath, (configData: any) => {
    console.log(configData);
    Base.requestConfigFile("config_api.json", (otherConfigData: any) => {
      next(Object.assign(configData, otherConfigData));
    });
  });
};

(window as any).initSheet = () => {
  (window as any).store.changeLoadingStatus("signing");
  Sheet.init(() => (window as any).store.init());
};

loadConfig((config) => {
  console.log("location.hash", location.hash);
  (window as any).config = config;
  (window as any).store.loadConfig(config);

  // Using React 19's createRoot API
  const container = document.getElementById("app");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }

  console.log("valid hash", Base.validHash());
  if (Base.validHash()) {
    (window as any).initSheet();
  } else {
    (window as any).store.changeLoadingStatus("prompting table");
  }
});
