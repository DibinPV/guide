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

const DEFAULT_STYLE = "https://demotiles.maplibre.org/style.json";

export default function MapView({ locations }: { locations: MapLocation[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_STYLE,
      center: [2.3522, 48.8566],
      zoom: 3
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }));

    locations.forEach((loc) => {
      const el = document.createElement("div");
      el.className = "w-3 h-3 rounded-full bg-sun shadow";
      new maplibregl.Marker({ element: el })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<strong>${loc.title}</strong>`))
        .addTo(map);
    });

    if (navigator.geolocation) {
      setStatus("Locating you...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          new maplibregl.Marker({ color: "#2a5b4b" })
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.Popup().setHTML("You are here"))
            .addTo(map);
          map.flyTo({ center: [longitude, latitude], zoom: 10 });
          setStatus("");
        },
        () => setStatus("Location not available"),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    return () => map.remove();
  }, [locations]);

  return (
    <div className="grid gap-3">
      {status ? <p className="text-sm text-black/60">{status}</p> : null}
      <div ref={containerRef} className="map-container" />
    </div>
  );
}
