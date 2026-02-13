import Link from "next/link";
import MapView, { MapLocation } from "@/components/MapView";
import { getAllLocations } from "@/lib/content";

export default async function MapPage() {
  const locations = await getAllLocations();
  const mapped: MapLocation[] = locations.map((loc) => ({
    lang: loc.lang,
    slug: loc.slug,
    title: loc.meta.title,
    country: loc.meta.country,
    lat: loc.meta.lat || 0,
    lng: loc.meta.lng || 0
  }));

  return (
    <main className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-moss">Map</p>
          <h2 className="text-2xl font-display">Nearby and saved places</h2>
        </div>
        <Link className="text-sm underline" href="/">
          Back home
        </Link>
      </div>

      <MapView locations={mapped} />

      <section className="grid gap-3">
        <h3 className="text-lg font-display">Locations</h3>
        <div className="grid gap-2">
          {mapped.map((loc) => (
            <Link
              key={`${loc.lang}-${loc.slug}`}
              href={`/${loc.lang}/${loc.slug}`}
              className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold">{loc.title}</p>
                <p className="text-xs text-black/60">{loc.country}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-moss">
                {loc.lang}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
