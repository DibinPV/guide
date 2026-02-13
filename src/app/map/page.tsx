import Link from "next/link";
import MapView, { MapLocation } from "@/components/MapView";
import { getAllPlaces } from "@/lib/places";

export default async function MapPage() {
  const places = await getAllPlaces();
  const mapped: MapLocation[] = places
    .filter((place) => typeof place.lat === "number" && typeof place.lng === "number")
    .map((place) => ({
      lang: "ru",
      slug: place.slug,
      title: place.title,
      country: place.country,
      lat: place.lat || 0,
      lng: place.lng || 0
    }));

  return (
    <main>
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Карта</p>
        <h2 className="mt-2 text-h2">Места рядом и сохранённые</h2>
        <Link className="text-xs text-soft hover:underline mt-2 inline-block" href="/">
          На главную
        </Link>
      </section>

      <section className="section">
        <MapView locations={mapped} />
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Локации</h3>
        </div>
        <div className="section-inner grid gap-2">
          {mapped.map((loc) => (
            <Link
              key={`${loc.lang}-${loc.slug}`}
              href={`/places/${loc.slug}`}
              className="card card-link"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-strong">{loc.title}</p>
                  <p className="text-xs text-soft">{loc.country}</p>
                </div>
                <span className="card-chevron">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
