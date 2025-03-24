// Allow PNG imports
declare module "*.png" {
  const value: any;
  export default value;
}

// Allow JPG imports
declare module "*.jpg" {
  const value: any;
  export default value;
}

// Allow SVG imports
declare module "*.svg" {
  const value: any;
  export default value;
}

// Allow other image formats
declare module "*.jpeg" {
  const value: any;
  export default value;
}

declare module "*.gif" {
  const value: any;
  export default value;
}

// Any other asset types you might use in the future
declare module "*.webp" {
  const value: any;
  export default value;
}

// For CSS/SCSS modules if needed
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

// For external modules without type definitions
declare module "leaflet.measure";
declare module "leaflet.markercluster.placementstrategies";
declare module "react-leaflet-markercluster";

// Extended Leaflet types
declare namespace L {
  export interface LeafletEvent {
    type: string;
    target: any;
    latlng?: LatLng;
  }

  export interface LeafletMouseEvent extends LeafletEvent {
    latlng: LatLng;
    layerPoint: Point;
    containerPoint: Point;
    originalEvent: MouseEvent;
  }

  export interface Layer {
    bindTooltip(content: string, options?: TooltipOptions): this;
    getLatLng(): LatLng;
  }

  export interface MapOptions {
    zoomSnap?: number;
    zoomDelta?: number;
    worldCopyJump?: boolean;
  }

  export namespace control {
    function geonames(options: any): Control;
    function polylineMeasure(options: any): Control;
  }
}
