import Link from "next/link";
import { getToursDb, getTourDayCounts } from "@/lib/toursDb";
import { Badge } from "@/ui/Badge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ToursPage() {
  const tours = await getToursDb();
  const dayCounts = await getTourDayCounts(tours.map((tour) => tour.id));

  return (
    <main>
      <section className="page-hero">
        <p className="page-kicker">Туры</p>
        <h2 className="page-title mt-2">Маршруты по дням</h2>
        <p className="page-subtitle mt-2">Готовые туры с остановками, переходами и временем.</p>
      </section>

      <section className="section">
        <div className="section-inner grid gap-5">
          {tours.map((tour) => {
            const days = dayCounts.get(tour.id) ?? 0;
            return (
              <Link key={tour.slug} href={`/tours/${tour.slug}`} className="card card-link tour-card">
                <div className="tour-media">
                  <img src={tour.cover_url || "/images/placeholder-1.svg"} alt={`Тур ${tour.title}`} />
                  <span className="tour-duration">⏱ {days} дня</span>
                </div>
                <div>
                  <div className="tour-meta">
                    <div className="text-xs uppercase tracking-[0.2em] text-primary-60">
                      {tour.city} · {tour.country}
                    </div>
                    <Badge variant="tour" className="badge-soft">ТУР</Badge>
                  </div>
                  <h3 className="mt-3 text-h2">{tour.title}</h3>
                  <p className="text-sm text-soft mt-2">{tour.summary || "Маршрут с ключевыми остановками и заметками по пути."}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted">{days} дня · оффлайн</span>
                    <span className="card-chevron">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
