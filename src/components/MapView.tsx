"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapLocation = {
  lang: string;
  slug: string;
  title: string;
  country?: string;
  lat: number;
  lng: number;
};

const DEFAULT_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm"
    }
  ]
} as any;

export default function MapView({ locations }: { locations: MapLocation[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const isSupported =
      typeof (maplibregl as any).supported === "function"
        ? (maplibregl as any).supported()
        : typeof (maplibregl as any).Map !== "undefined";
    if (!isSupported) {
      setStatus("WebGL недоступен — карта не может быть загружена.");
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_STYLE,
      center: [2.3522, 48.8566],
      zoom: 3
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }));
    map.on("load", () => map.resize());
    map.on("error", (e) => {
      console.error("Map error", e?.error || e);
      setStatus("Не удалось загрузить карту");
    });

    locations.forEach((loc) => {
      const el = document.createElement("div");
      el.className = "map-marker";
      new maplibregl.Marker({ element: el })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<strong>${loc.title}</strong>`))
        .addTo(map);
    });

    if (navigator.geolocation) {
      setStatus("Определяем ваше местоположение...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          new maplibregl.Marker({ color: "#2a5b4b" })
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.Popup().setHTML("Вы здесь"))
            .addTo(map);
          map.flyTo({ center: [longitude, latitude], zoom: 10 });
          setStatus("");
        },
        () => setStatus("Не удалось определить местоположение"),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    const markers = (map as any)._codexMarkers as maplibregl.Marker[] | undefined;
    if (markers && markers.length) {
      markers.forEach((m) => m.remove());
    }

    const nextMarkers = locations.map((loc) => {
      const el = document.createElement("div");
      el.className = "map-marker";
      return new maplibregl.Marker({ element: el })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<strong>${loc.title}</strong>`))
        .addTo(map);
    });

    (map as any)._codexMarkers = nextMarkers;
  }, [locations]);

  return (
    <div className="grid gap-3">
      {status ? <p className="text-sm text-soft">{status}</p> : null}
      <div ref={containerRef} className="map-container" />
    </div>
  );
}
