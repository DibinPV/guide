import Link from "next/link";
import { getAllTours } from "@/lib/tours";
import { Badge } from "@/ui/Badge";

export default async function ToursPage() {
  const tours = await getAllTours();

  return (
    <main>
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Туры</p>
        <h2 className="mt-2 text-h2">
          Маршруты по дням
        </h2>
      </section>

      <section className="section">
        <div className="section-inner grid gap-4 md:grid-cols-2">
          {tours.map((tour) => (
            <Link key={tour.slug} href={`/tours/${tour.slug}`} className="card card-link">
              <div className="card-tour__gradient" />
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-primary">
                  {tour.city} · {tour.country}
                </div>
                <Badge variant="tour">ТУР</Badge>
              </div>
              <h3 className="mt-3 text-h3">{tour.title}</h3>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-soft">⏱ {tour.days.length} дня</p>
                <span className="card-chevron">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
