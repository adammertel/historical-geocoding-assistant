// General types used throughout the application

// Geographic coordinates [lat, lng]
export type LatLng = [number, number];

// Geographic extent [[lat1, lng1], [lat2, lng2]]
export type GeoExtent = [LatLng, LatLng];

// Configuration related types
export interface ColumnConfig {
  name: string;
  x: string;
  y: string;
  certainty: string;
  placeName: string;
  note: string;
  editor: string;
  [key: string]: string;
}

export interface BasemapConfig {
  map1: string;
  map2: string;
  opacity: number;
}

export interface OverlayConfig {
  id: string;
  opacity: number;
}

export interface AppConfig {
  storeOpts: StoreOptions;
  loadingMessages: Record<string, string>;
  defaultSettingsOpen: boolean;
  messageLoadingTime: number;
  columnNames: Record<string, { include: string[]; exclude: string[] }>;
  coordinatesPrecision: number;
}

export interface StoreOptions {
  columns: ColumnConfig;
  defaultRow: number;
  mapCenter: LatLng;
  mapZoom: number;
  maxGeoExtent: GeoExtent;
  focusZoom: number;
  basemaps: BasemapConfig;
  overlays: OverlayConfig[];
  displayOtherRecords: boolean;
  mapClusters: boolean;
  focusOnRecordChange: boolean;
}

// Record related types
export interface RecordData {
  [key: string]: string;
}

export interface GeoRecord {
  x: string | number;
  y: string | number;
  name: string;
  row: string | number;
}

export interface RecordName {
  name: string;
  row: string | number;
}

// Suggestion related types
export interface Suggestion {
  id: string;
  name: string;
  description: string;
  ll: LatLng;
  inExtent?: boolean;
}

export interface SuggestionRecord {
  id?: string;
  ll: [number, number] | false;
  country: string;
  rank: number;
  name: string;
  url: string;
  type: string;
  info: string;
  sim?: number;
  [key: string]: any;
}

export interface SuggestionSource {
  id: string;
  label: string;
  urls: {
    base?: (term: string) => string;
    record?: (id: string) => string;
    [key: string]: any;
  };
  preload?: () => void;
  getRecords: (
    source: SuggestionSource,
    term: string,
    opts: any,
    next: (records: SuggestionRecord[], problem: boolean) => void
  ) => void;
  recordMap: {
    [key: string]: (r: any) => any;
  };
}

// Basemap related types
export interface BaseMap {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

// Leaflet related types - partial definitions to avoid full @types/leaflet dependency
export interface LeafletBounds {
  contains: (latLng: any) => boolean;
}

export interface LeafletMap {
  getBounds: () => LeafletBounds;
}
