import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// The MapController component - moved here from separate file for simplicity
const MapController: React.FC = () => {
  const map = useMap();
  const store = (window as any).store;

  useEffect(() => {
    (window as any).map = map;

    // Initial map setup
    map.setView(store.center, store.zoom);

    // Listen for map movement events
    const handleMapMove = () => {
      store.setMapView(map.getCenter(), map.getZoom());
    };

    map.on("moveend", handleMapMove);

    return () => {
      map.off("moveend", handleMapMove);
    };
  }, [map, store]);

  return null;
};

interface MapProps {
  // Add any props if needed
}

const AppMap: React.FC<MapProps> = observer(() => {
  const store = (window as any).store;
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Additional map initialization if needed

    return () => {
      // Cleanup
    };
  }, []);

  if (!store.shouldRenderApp) {
    return null;
  }

  // Get basemap configuration
  const basemaps = (window as any).basemaps || {};
  const currentBasemap = basemaps[store.basemap] || {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };

  return (
    <MapContainer
      className="map-container"
      style={{ height: "100vh", width: "100%" }}
      center={store.center}
      zoom={store.zoom}
      zoomControl={false}
      ref={mapRef}>
      <TileLayer
        url={currentBasemap.url}
        attribution={currentBasemap.attribution}
      />

      {/* Display markers for points of interest */}
      {store.points &&
        store.points.map((point: any, index: number) => (
          <Marker key={`point-${index}`} position={[point.lat, point.lng]}>
            <Popup>{point.name || "Unnamed location"}</Popup>
          </Marker>
        ))}

      {/* Display overlay GeoJSON data if available */}
      {store.overlays &&
        store.overlays.map((overlayKey: string) => {
          const overlay = (window as any).overlaymaps[overlayKey];
          if (overlay && overlay.data && overlay.type === "geojson") {
            return (
              <GeoJSON
                key={overlayKey}
                data={overlay.data}
                style={() => ({
                  color: overlay.color || "#3388ff",
                  weight: overlay.weight || 3,
                  opacity: overlay.opacity || 0.5,
                })}
              />
            );
          }
          return null;
        })}

      <MapController />
    </MapContainer>
  );
});

export default AppMap;
