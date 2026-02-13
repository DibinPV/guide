import Link from "next/link";
import { getAllPlaces } from "@/lib/places";
import { Badge } from "@/ui/Badge";

export default async function PlacesPage() {
  const places = await getAllPlaces();

  return (
    <main>
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Локации</p>
        <h2 className="mt-2 text-h2">Список мест</h2>
      </section>

      <section className="section">
        <div className="section-inner grid gap-4 md:grid-cols-2">
          {places.map((place) => (
            <Link key={place.slug} href={`/places/${place.slug}`} className="card card-link">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-primary">
                  {place.city} · {place.country}
                </div>
                <Badge variant="place">МЕСТО</Badge>
              </div>
              <h3 className="mt-3 text-h3">{place.title}</h3>
              <div className="mt-2 flex items-center justify-end">
                <span className="card-chevron">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
