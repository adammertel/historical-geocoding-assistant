import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

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

const TESTING = false; // Set to true only for testing config
console.log("testing mode", TESTING);

(window as any).version = version;

// global variables
(window as any).map = false;
(window as any).Base = Base;
(window as any).SuggestionSources = SuggestionSources as any[];

// Safely preload suggestion sources with error handling
(SuggestionSources as any[]).forEach((s: any) => {
  if (s.preload) {
    try {
      s.preload();
    } catch (error) {
      console.warn(`Failed to preload suggestion source ${s.id}:`, error);
    }
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

// Helper function to check if GAPI is properly initialized
const isGapiInitialized = (): boolean => {
  try {
    // Check each component separately to isolate what might be missing
    if (!gapi) return false;
    if (!gapi.client) return false;
    if (!gapi.auth2) return false;

    // Try to access the auth instance
    const authInstance = gapi.auth2.getAuthInstance();
    return !!authInstance;
  } catch (e) {
    console.log("GAPI not fully initialized:", e);
    return false;
  }
};

// Initialize Google API before starting the application
const initGoogleApi = (config: any, next: () => void) => {
  const { apiKey, clientId } = config;

  if (!apiKey || !clientId) {
    console.error("Missing API key or client ID in config");
    next(); // Continue anyway to avoid blocking the app
    return;
  }

  // Check if gapi is already loaded and initialized
  if (isGapiInitialized()) {
    console.log("GAPI already initialized");
    next();
    return;
  }

  // Load the Google API client with error handling
  try {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey,
          clientId,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope:
            "https://www.googleapis.com/auth/spreadsheets email profile openid",
        })
        .then(
          () => {
            console.log("GAPI client initialized successfully");
            next();
          },
          (error: any) => {
            console.error("Error initializing GAPI client:", error);
            // Still call next to avoid blocking the application
            next();
          }
        );
    });
  } catch (e) {
    console.error("Critical error loading GAPI:", e);
    next(); // Continue anyway to avoid blocking the app
  }
};

(window as any).initSheet = () => {
  console.log("Initializing sheet...");
  (window as any).store.changeLoadingStatus("signing");
  Sheet.init(() => {
    console.log("Sheet initialization complete");
    (window as any).store.init();
  });
};

// Main application initialization
loadConfig((config) => {
  console.log("Configuration loaded");
  (window as any).config = config;
  (window as any).store.loadConfig(config);

  // Using React 19's createRoot API with GoogleOAuthProvider
  const container = document.getElementById("app");
  if (container) {
    const root = createRoot(container);
    root.render(
      <GoogleOAuthProvider clientId={config.clientId}>
        <App />
      </GoogleOAuthProvider>
    );
  }

  // Only auto-initialize if hash is valid and this isn't the first time
  // Otherwise, let the user go through TablePrompt
  console.log("Checking hash validity:", Base.validHash());
  if (
    Base.validHash() &&
    localStorage.getItem("previously_authenticated") === "true"
  ) {
    console.log("Valid hash found, auto-initializing sheet");
    (window as any).initSheet();
  } else {
    console.log("No valid hash or first-time user, showing table prompt");
    (window as any).store.changeLoadingStatus("prompting table");
  }
});
