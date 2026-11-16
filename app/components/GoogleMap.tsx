"use client";

import { useEffect, useRef, useState } from "react";

type FleetVehicle = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  color: string;
};

type GoogleMapProps = {
  vehicles: FleetVehicle[];
  selectedVehicle: string;
  onVehicleSelect: (vehicleId: string) => void;
};

type GoogleMapPoint = { lat: number; lng: number };
type GoogleMapPadding = { top: number; right: number; bottom: number; left: number };

type GoogleMapInstance = {
  fitBounds(bounds: GoogleMapBounds, padding?: GoogleMapPadding): void;
  addListener(
    event: "tilesloaded",
    handler: () => void,
  ): { remove(): void };
};

type GoogleMapBounds = {
  extend(point: GoogleMapPoint): GoogleMapBounds;
};

type GooglePolyline = {
  setMap(map: GoogleMapInstance | null): void;
};

type GoogleAdvancedMarker = {
  map: GoogleMapInstance | null;
  addEventListener(event: "gmp-click", listener: () => void): void;
};

type GoogleMapsLibraries = {
  maps: {
    Map: new (
      element: HTMLElement,
      options: {
        center: GoogleMapPoint;
        zoom: number;
        mapId: string;
        mapTypeControl: boolean;
        fullscreenControl: boolean;
        streetViewControl: boolean;
        zoomControl: boolean;
        clickableIcons: boolean;
        gestureHandling: "greedy";
      },
    ) => GoogleMapInstance;
  };
  marker: {
    AdvancedMarkerElement: new (options: {
      map: GoogleMapInstance;
      position: GoogleMapPoint;
      title: string;
      content: HTMLElement;
      gmpClickable: boolean;
      zIndex: number;
    }) => GoogleAdvancedMarker;
  };
};

type GoogleMapsApi = {
  importLibrary<K extends keyof GoogleMapsLibraries>(
    name: K,
  ): Promise<GoogleMapsLibraries[K]>;
  LatLngBounds: new () => GoogleMapBounds;
  Polyline: new (options: {
    path: GoogleMapPoint[];
    geodesic: boolean;
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
    map: GoogleMapInstance;
  }) => GooglePolyline;
};

declare global {
  interface Window {
    google?: { maps?: GoogleMapsApi };
    googleMapsLoaderPromise?: Promise<GoogleMapsApi>;
    gm_authFailure?: () => void;
  }
}

function loadGoogleMapsApi(apiKey: string): Promise<GoogleMapsApi> {
  const existingMaps = window.google?.maps;
  if (existingMaps?.importLibrary) {
    return Promise.resolve(existingMaps);
  }
  if (existingMaps?.LatLngBounds) {
    return Promise.reject(
      new Error(
        "A previous Google Maps script is already loaded. Fully reload the page to use the updated loader.",
      ),
    );
  }
  if (window.googleMapsLoaderPromise) {
    return window.googleMapsLoaderPromise;
  }

  const googleNamespace = window.google ?? {};
  const mapsNamespace = googleNamespace.maps ?? ({} as GoogleMapsApi);
  googleNamespace.maps = mapsNamespace;
  window.google = googleNamespace;

  let resolveScript: () => void = () => {};
  let rejectScript: (error: Error) => void = () => {};
  const scriptPromise = new Promise<void>((resolve, reject) => {
    resolveScript = resolve;
    rejectScript = reject;
  });
  const requestedLibraries = new Set<string>();
  let scriptStarted = false;

  const bootstrapImportLibrary: GoogleMapsApi["importLibrary"] = (
    library,
  ) => {
    requestedLibraries.add(library);
    if (!scriptStarted) {
      scriptStarted = true;
      const parameters = new URLSearchParams({
        key: apiKey,
        v: "weekly",
        callback: "google.maps.__ib__",
        libraries: Array.from(requestedLibraries).join(","),
      });
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?${parameters.toString()}`;
      script.async = true;
      script.onerror = () =>
        rejectScript(new Error("The Google Maps script failed to load."));
      (mapsNamespace as GoogleMapsApi & { __ib__?: () => void }).__ib__ =
        resolveScript;
      document.head.appendChild(script);
    }

    return scriptPromise.then(() => {
      const loadedImportLibrary = mapsNamespace.importLibrary;
      if (!loadedImportLibrary || loadedImportLibrary === bootstrapImportLibrary) {
        throw new Error("Google Maps did not initialize its library loader.");
      }
      return loadedImportLibrary(library);
    });
  };

  mapsNamespace.importLibrary = bootstrapImportLibrary;
  window.googleMapsLoaderPromise = scriptPromise.then(() => mapsNamespace);
  void bootstrapImportLibrary("maps").catch((error: unknown) => {
    rejectScript(
      error instanceof Error
        ? error
        : new Error("Google Maps failed to initialize."),
    );
  });

  return window.googleMapsLoaderPromise;
}

export default function GoogleMap({
  vehicles,
  selectedVehicle,
  onVehicleSelect,
}: GoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
  const mapElementRef = useRef<HTMLDivElement>(null);
  const markerElementsRef = useRef(new Map<string, HTMLDivElement>());
  const [apiReady, setApiReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    let cancelled = false;
    void loadGoogleMapsApi(apiKey)
      .then(() => {
        if (!cancelled) {
          setApiReady(true);
          setMapError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMapError(
            error instanceof Error
              ? `Google Maps could not be loaded: ${error.message}`
              : "Google Maps could not be loaded. Check the API key and network connection.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    const handleAuthFailure = () => {
      setMapError(
        "Google Maps rejected the API key. Check that the Maps JavaScript API is enabled and the key is allowed for this site.",
      );
    };

    window.gm_authFailure = handleAuthFailure;
    return () => {
      if (window.gm_authFailure === handleAuthFailure) {
        delete window.gm_authFailure;
      }
    };
  }, []);

  useEffect(() => {
    const mapsApi = window.google?.maps;
    if (!apiReady || !mapElementRef.current) {
      return;
    }
    if (!mapsApi) {
      setMapError("Google Maps loaded, but its Maps JavaScript API is unavailable.");
      return;
    }
    const loadedMapsApi = mapsApi;

    let cancelled = false;
    let tilesLoaded = false;
    let tileLoadTimeout: number | null = null;
    let tileLoadListener: { remove(): void } | null = null;
    const markers: GoogleAdvancedMarker[] = [];
    let route: GooglePolyline | null = null;

    async function initializeMap() {
      try {
        const [mapsLibrary, markerLibrary] = await Promise.all([
          loadedMapsApi.importLibrary("maps"),
          loadedMapsApi.importLibrary("marker"),
        ]);
        if (cancelled || !mapElementRef.current) {
          return;
        }

        const map = new mapsLibrary.Map(mapElementRef.current, {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 13,
          mapId,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });

        tileLoadListener = map.addListener("tilesloaded", () => {
          tilesLoaded = true;
          if (tileLoadTimeout !== null) {
            window.clearTimeout(tileLoadTimeout);
          }
          if (!cancelled) {
            setMapError(null);
            setMapReady(true);
          }
        });
        tileLoadTimeout = window.setTimeout(() => {
          if (!cancelled && !tilesLoaded) {
            setMapError(
              "Google Maps loaded, but map tiles did not. Check the API key, Maps JavaScript API, billing, and allowed website referrers.",
            );
          }
        }, 12000);

        const bounds = new loadedMapsApi.LatLngBounds();
        const positions: GoogleMapPoint[] = [];

        vehicles.forEach((vehicle) => {
          const position = {
            lat: vehicle.latitude,
            lng: vehicle.longitude,
          };
          const markerContent = document.createElement("div");
          markerContent.className = `google-vehicle-marker ${vehicle.color}`;
          markerContent.setAttribute(
            "aria-label",
            `${vehicle.name}, ${vehicle.id}`,
          );
          const markerLabel = document.createElement("span");
          markerLabel.textContent = vehicle.id.slice(-2);
          markerContent.appendChild(markerLabel);

          const marker = new markerLibrary.AdvancedMarkerElement({
            map,
            position,
            title: `${vehicle.name} · ${vehicle.id}`,
            content: markerContent,
            gmpClickable: true,
            zIndex: 1,
          });
          marker.addEventListener("gmp-click", () =>
            onVehicleSelect(vehicle.id),
          );

          markers.push(marker);
          markerElementsRef.current.set(vehicle.id, markerContent);
          positions.push(position);
          bounds.extend(position);
        });

        if (positions.length > 1) {
          route = new loadedMapsApi.Polyline({
            path: positions,
            geodesic: true,
            strokeColor: "#4f9d79",
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map,
          });
          map.fitBounds(bounds, { top: 42, right: 42, bottom: 42, left: 42 });
        }
      } catch (error) {
        if (!cancelled) {
          setMapError(
            error instanceof Error
              ? `Google Maps could not be initialized: ${error.message}`
              : "Google Maps could not be initialized. Check the API key and Maps JavaScript API settings.",
          );
        }
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
      if (tileLoadTimeout !== null) {
        window.clearTimeout(tileLoadTimeout);
      }
      tileLoadListener?.remove();
      markers.forEach((marker) => {
        marker.map = null;
      });
      route?.setMap(null);
      markerElementsRef.current.clear();
    };
  }, [apiReady, mapId, onVehicleSelect, vehicles]);

  useEffect(() => {
    markerElementsRef.current.forEach((element, vehicleId) => {
      element.classList.toggle("selected", vehicleId === selectedVehicle);
    });
  }, [mapReady, selectedVehicle]);

  return (
    <div
      className="map-canvas"
      role="group"
      aria-label="Interactive Google map showing fleet vehicles around San Francisco"
    >
      <div className="google-map" ref={mapElementRef} />
      {!apiKey || mapError || !mapReady ? (
        <div className="map-message">
          <div className="map-message-card">
            <span className="map-message-icon">◎</span>
            <strong>
              {!apiKey
                ? "Connect Google Maps"
                : mapError
                  ? "Map unavailable"
                  : "Loading Google Maps…"}
            </strong>
            <p>
              {!apiKey
                ? "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local, enable the Maps JavaScript API and billing in Google Cloud, then restart the dev server."
                : mapError || "Connecting to Google Maps. This may take a moment."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
