import Link from "next/link";
import FeedbackSection from "@/components/FeedbackSection";
import TourAside from "@/components/tours/TourAside";
import {
  getToursDb,
  getTourBySlugDb,
  getTourDaysDb,
  getDayEventCountsDb,
  getDayEventPreviews,
  getTourEventSummary
} from "@/lib/toursDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  const tours = await getToursDb();
  return tours.map((tour) => ({ slug: tour.slug }));
}

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours <= 0) return `${minutes} мин`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}

export default async function TourPage({ params }: { params: { slug: string } }) {
  const tour = await getTourBySlugDb(params.slug);
  if (!tour) {
    return (
      <main>
        <section className="page-hero">
          <p className="page-kicker">Тур</p>
          <h2 className="page-title mt-2">Тур не найден</h2>
        </section>
      </main>
    );
  }

  const days = await getTourDaysDb(tour.id);
  const eventCounts = await getDayEventCountsDb(days.map((day) => day.id));
  const previews = await getDayEventPreviews(days.map((day) => day.id));
  const summary = await getTourEventSummary(tour.id);
  const firstDay = days[0]?.day_number;

  return (
    <main>
      <section className="section">
        <div className="mb-4 text-sm text-soft">
          <Link href="/tours">← Все туры</Link>
        </div>
        <div className="card tour-hero">
          <div className="tour-hero-media">
            <img src={tour.cover_url || "/images/placeholder-1.svg"} alt={tour.title} />
          </div>
          <div className="tour-hero-body">
            <div className="tour-hero-meta">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Тур</p>
              <span className="chip">{tour.city} · {tour.country}</span>
              <span className="chip">Оффлайн</span>
            </div>
            <h2 className="tour-hero-title mt-2">{tour.title}</h2>
            {tour.summary ? <p className="tour-hero-summary text-sm text-soft mt-3">{tour.summary}</p> : null}
            <div className="tour-hero-stats">
              <span className="chip">Дней: {days.length}</span>
              <span className="chip">Событий: {summary.totalEvents}</span>
              <span className="chip">Длительность: {formatMinutes(summary.totalMinutes)}</span>
            </div>
            <div className="tour-hero-actions">
              {firstDay ? (
                <Link href={`/tours/${tour.slug}/day/${firstDay}`} className="button-primary">
                  Начать маршрут
                </Link>
              ) : null}
              <Link href="/map" className="button-secondary">
                Открыть карту
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="tour-layout section">
        <section>
          <div className="section-header">
            <span className="section-marker" />
            <h3 className="text-h3">Дни маршрута</h3>
          </div>
          <div className="section-inner grid gap-4">
            {days.map((day) => {
              const count = eventCounts.get(day.id) ?? 0;
              const previewList = previews.get(day.id) ?? [];
              return (
                <div key={day.day_number} id={`day-${day.day_number}`}>
                  <Link
                    href={`/tours/${tour.slug}/day/${day.day_number}`}
                    className="card card-link tour-day-card"
                  >
                    <div className="tour-day-meta">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary">День {day.day_number}</p>
                      <p className="text-sm text-soft mt-2">Событий: {count}</p>
                    </div>
                    <div className="tour-day-preview">
                      <h4 className="text-h3">{day.title}</h4>
                      {day.summary ? <p className="text-sm text-muted">{day.summary}</p> : null}
                      <div className="grid gap-2">
                        {previewList.length ? (
                          previewList.map((event) => (
                            <div key={event.id} className="tour-day-preview-item">
                              <span />
                              <div>{event.start_time} · {event.title}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-soft">События скоро появятся.</p>
                        )}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <span className="card-chevron">→</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="tour-aside">
          <TourAside
            days={days.map((day) => ({ id: day.id, day_number: day.day_number, title: day.title }))}
            firstDayHref={firstDay ? `/tours/${tour.slug}/day/${firstDay}` : undefined}
          />
        </aside>
      </div>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Отзыв о туре</h3>
        </div>
        <div className="section-inner">
          <FeedbackSection
            title="Отзыв о туре"
            buttonLabel="Оставить отзыв"
            payload={{ target: "tour", tour_slug: tour.slug }}
          />
        </div>
      </section>
    </main>
  );
}
