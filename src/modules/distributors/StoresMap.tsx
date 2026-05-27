import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { Distributor } from './types';
import { getDistributorMapsHref, getDistributorPhoneHref } from './contactLinks';

interface StoresMapProps {
  distributors: Distributor[];
}

type DistributorPoint = {
  distributor: Distributor;
  lat: number;
  lng: number;
};

const bogotaCenter: [number, number] = [4.6062, -74.1057];
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
let googleMapsLoader: Promise<void> | null = null;

declare global {
  interface Window {
    google?: {
      maps: {
        Animation?: {
          DROP: number;
        };
        LatLngBounds: new () => {
          extend: (point: { lat: number; lng: number }) => void;
        };
        Map: new (
          element: HTMLElement,
          options: {
            center: { lat: number; lng: number };
            clickableIcons?: boolean;
            disableDefaultUI?: boolean;
            fullscreenControl?: boolean;
            gestureHandling?: string;
            mapTypeControl?: boolean;
            streetViewControl?: boolean;
            zoom: number;
            zoomControl?: boolean;
          },
        ) => {
          addListener: (eventName: string, callback: () => void) => void;
          fitBounds: (bounds: unknown, padding?: number) => void;
          panTo: (point: { lat: number; lng: number }) => void;
          setZoom: (zoom: number) => void;
        };
        Marker: new (options: {
          animation?: number;
          icon?: {
            fillColor: string;
            fillOpacity: number;
            path: number;
            scale: number;
            strokeColor: string;
            strokeWeight: number;
          };
          map: unknown;
          position: { lat: number; lng: number };
          title: string;
        }) => {
          addListener: (eventName: string, callback: () => void) => void;
          setMap: (map: unknown | null) => void;
        };
        InfoWindow: new (options: { content: string }) => {
          open: (options: { anchor: unknown; map: unknown }) => void;
        };
        SymbolPath: {
          CIRCLE: number;
        };
      };
    };
  }
}

function getCoordinates(distributor: Distributor) {
  const lat = Number(distributor.lat ?? distributor.coordinates?.[0]);
  const lng = Number(distributor.lng ?? distributor.coordinates?.[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

function getDistributorPoints(distributors: Distributor[]) {
  return distributors
    .map((distributor) => {
      const coordinates = getCoordinates(distributor);
      if (!coordinates) return null;

      return {
        distributor,
        lat: coordinates.lat,
        lng: coordinates.lng,
      };
    })
    .filter((point): point is DistributorPoint => Boolean(point));
}

function StoreMapSelection({
  distributor,
  onFocus,
  onClose,
}: {
  distributor: Distributor;
  onFocus: () => void;
  onClose: () => void;
}) {
  const phoneHref = getDistributorPhoneHref(distributor.phone);
  const mapsHref = getDistributorMapsHref(distributor);

  return (
    <div className="catalog-map-selected" aria-label={`Acciones para ${distributor.name}`}>
      <button className="catalog-map-selected__close" type="button" aria-label="Cerrar punto seleccionado" onClick={onClose}>
        ×
      </button>
      <button className="catalog-map-selected__place" type="button" onClick={onFocus}>
        <strong>{distributor.name}</strong>
      </button>
      <div className="catalog-map-selected__actions">
        {phoneHref ? (
          <a href={phoneHref} className="catalog-map-selected__action catalog-map-selected__action--call">
            Llamar
          </a>
        ) : null}
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="catalog-map-selected__action catalog-map-selected__action--route"
        >
          Ruta
        </a>
      </div>
    </div>
  );
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve();
  if (googleMapsLoader) return googleMapsLoader;

  googleMapsLoader = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-tonner-google-maps]');

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('No fue posible cargar Google Maps.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.tonnerGoogleMaps = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('No fue posible cargar Google Maps.')), { once: true });
    document.head.appendChild(script);
  });

  return googleMapsLoader;
}

function LeafletStoresMap({ distributors }: StoresMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  const points = useMemo(() => getDistributorPoints(distributors), [distributors]);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const isTouchViewport = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const map = L.map(mapElementRef.current, {
      attributionControl: true,
      dragging: !isTouchViewport,
      scrollWheelZoom: !isTouchViewport,
      touchZoom: true,
      zoomControl: true,
    }).setView(bogotaCenter, 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      detectRetina: true,
      maxNativeZoom: 20,
      maxZoom: 20,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

      setTimeout(() => map.invalidateSize(), 0);

    map.on('click', () => setSelectedDistributor(null));

    return () => {
      map.off('click');
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    const icon = L.divIcon({
      className: 'catalog-map-pin',
      html: '<span></span>',
      iconAnchor: [13, 28],
      iconSize: [26, 28],
      popupAnchor: [0, -24],
    });

    points.forEach(({ distributor, lat, lng }) => {
      const marker = L.marker([lat, lng], { icon }).addTo(markers);
      marker.on('click', () => setSelectedDistributor(distributor));
    });

    if (points.length) {
      map.fitBounds(
        L.latLngBounds(points.map(({ lat, lng }) => [lat, lng])),
        {
          maxZoom: 12,
          padding: [24, 24],
        },
      );
    }
  }, [points]);

  const focusSelectedDistributor = () => {
    const coordinates = selectedDistributor ? getCoordinates(selectedDistributor) : null;
    if (!coordinates || !mapRef.current) return;

    mapRef.current.flyTo([coordinates.lat, coordinates.lng], 15, {
      duration: 0.7,
    });
  };

  return (
    <>
      <div ref={mapElementRef} className="catalog-real-map" aria-label="Mapa real de puntos de venta" />
      {selectedDistributor ? (
        <StoreMapSelection
          distributor={selectedDistributor}
          onFocus={focusSelectedDistributor}
          onClose={() => setSelectedDistributor(null)}
        />
      ) : null}
    </>
  );
}

function GoogleStoresMap({ distributors, onUnavailable }: StoresMapProps & { onUnavailable: () => void }) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<InstanceType<NonNullable<Window['google']>['maps']['Map']> | null>(null);
  const markersRef = useRef<Array<InstanceType<NonNullable<Window['google']>['maps']['Marker']>>>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const points = useMemo(() => getDistributorPoints(distributors), [distributors]);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (!googleMapsApiKey || !mapElementRef.current || mapRef.current) return;

      try {
        await loadGoogleMaps(googleMapsApiKey);
      } catch {
        if (!cancelled) onUnavailable();
        return;
      }

      if (cancelled || !window.google?.maps || !mapElementRef.current) return;

      mapRef.current = new window.google.maps.Map(mapElementRef.current, {
        center: { lat: bogotaCenter[0], lng: bogotaCenter[1] },
        clickableIcons: false,
        disableDefaultUI: true,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        mapTypeControl: false,
        streetViewControl: false,
        zoom: 12,
        zoomControl: true,
      });

      mapRef.current.addListener('click', () => setSelectedDistributor(null));
    }

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, [onUnavailable]);

  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;

    const googleMaps = window.google.maps;
    const map = mapRef.current;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new googleMaps.LatLngBounds();

    points.forEach(({ distributor, lat, lng }) => {
      const marker = new googleMaps.Marker({
        animation: googleMaps.Animation?.DROP,
        icon: {
          fillColor: '#2d59c7',
          fillOpacity: 1,
          path: googleMaps.SymbolPath.CIRCLE,
          scale: 9,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        map,
        position: { lat, lng },
        title: distributor.name,
      });

      marker.addListener('click', () => {
        setSelectedDistributor(distributor);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat, lng });
    });

    if (points.length) {
      map.fitBounds(bounds, 42);
    }
  }, [points]);

  const focusSelectedDistributor = () => {
    const coordinates = selectedDistributor ? getCoordinates(selectedDistributor) : null;
    if (!coordinates || !mapRef.current) return;

    mapRef.current.panTo({ lat: coordinates.lat, lng: coordinates.lng });
    mapRef.current.setZoom(15);
  };

  return (
    <>
      <div
        ref={mapElementRef}
        className="catalog-real-map catalog-real-map--google"
        aria-label="Mapa Google de puntos de venta"
      />
      {selectedDistributor ? (
        <StoreMapSelection
          distributor={selectedDistributor}
          onFocus={focusSelectedDistributor}
          onClose={() => setSelectedDistributor(null)}
        />
      ) : null}
    </>
  );
}

export default function StoresMap({ distributors }: StoresMapProps) {
  const [googleUnavailable, setGoogleUnavailable] = useState(false);

  if (googleMapsApiKey && !googleUnavailable) {
    return <GoogleStoresMap distributors={distributors} onUnavailable={() => setGoogleUnavailable(true)} />;
  }

  return <LeafletStoresMap distributors={distributors} />;
}
