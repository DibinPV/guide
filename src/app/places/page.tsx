import Link from "next/link";
import { getAllPlaces } from "@/lib/places";
import { Badge } from "@/ui/Badge";

export default async function PlacesPage() {
  const places = await getAllPlaces();

  return (
    <main>
      <section className="page-hero">
        <p className="page-kicker">Локации</p>
        <h2 className="page-title mt-2">Список мест</h2>
        <p className="page-subtitle mt-2">Исторические точки и короткие заметки.</p>
      </section>

      <section className="section">
        <div className="section-inner grid gap-4 md:grid-cols-2">
          {places.map((place) => (
            <Link key={place.slug} href={`/places/${place.slug}`} className="card card-link playlist-card">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-primary-60">
                  {place.city} · {place.country}
                </div>
                <Badge variant="place" className="badge-soft">МЕСТО</Badge>
              </div>
              <h3 className="mt-3 text-h3">{place.title}</h3>
              <p className="text-sm text-soft mt-2">История, факты и детали для изучения.</p>
              <div className="mt-4 flex items-center justify-end">
                <span className="card-chevron">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
