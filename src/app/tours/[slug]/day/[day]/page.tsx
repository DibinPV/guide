import Link from "next/link";
import { getAllTours, getTour } from "@/lib/tours";
import { getPlace } from "@/lib/places";
import { Badge } from "@/ui/Badge";
import FeedbackSection from "@/components/FeedbackSection";

function formatMode(mode: string) {
  switch (mode) {
    case "walk":
      return "пешком";
    case "bus":
      return "автобус";
    case "car":
      return "машина";
    case "metro":
      return "метро";
    case "train":
      return "поезд";
    case "plane":
      return "самолёт";
    default:
      return mode;
  }
}

function ModeIcon({ mode }: { mode: string }) {
  const common = "w-4 h-4";
  switch (mode) {
    case "walk":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="2" />
          <path d="M9 21l2-6-2-4 3-2 3 3" />
          <path d="M13 9l2-2" />
        </svg>
      );
    case "bus":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="12" rx="2" />
          <path d="M7 16v2M17 16v2" />
          <path d="M7 8h10" />
        </svg>
      );
    case "car":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12l2-5h10l2 5" />
          <rect x="4" y="12" width="16" height="6" rx="2" />
          <circle cx="8" cy="18" r="1" />
          <circle cx="16" cy="18" r="1" />
        </svg>
      );
    case "metro":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="4" width="12" height="14" rx="3" />
          <path d="M9 18l-2 2M15 18l2 2" />
          <path d="M9 8h6" />
        </svg>
      );
    case "train":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="7" y="3" width="10" height="14" rx="2" />
          <path d="M7 13h10" />
          <circle cx="10" cy="17" r="1" />
          <circle cx="14" cy="17" r="1" />
          <path d="M9 21l-2 2M15 21l2 2" />
        </svg>
      );
    case "plane":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l18-6-6 6 6 6-18-6z" />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      );
  }
}

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours <= 0) return `${minutes} мин`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}

export async function generateStaticParams() {
  const tours = await getAllTours();
  const params = [] as { slug: string; day: string }[];
  for (const tour of tours) {
    for (const day of tour.days) {
      params.push({ slug: tour.slug, day: String(day.day) });
    }
  }
  return params;
}

export default async function TourDayPage({ params }: { params: { slug: string; day: string } }) {
  const tour = await getTour(params.slug);
  const dayNum = Number(params.day);
  const day = tour.days.find((d) => d.day === dayNum);

  if (!day) {
    return (
      <main>
        <p>День не найден.</p>
      </main>
    );
  }

  const stops = await Promise.all(
    day.stops.map(async (stop) => ({
      stop,
      place: await getPlace(stop.place)
    }))
  );

  const totalTravelMinutes = day.stops.reduce((sum, stop) => {
    return sum + (stop.travelToNext?.durationMinutes || 0);
  }, 0);
  const totalDistanceKm = day.stops.reduce((sum, stop) => {
    return sum + (stop.travelToNext?.distanceKm || 0);
  }, 0);

  return (
    <main>
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">День {day.day}</p>
        <h2 className="mt-2 text-h2">{day.title}</h2>
        <Link className="text-xs text-soft hover:underline mt-2 inline-block" href={`/tours/${tour.slug}`}>
          Назад к туру
        </Link>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Итоги дня</h3>
        </div>
        <div className="section-inner flex flex-wrap gap-2">
          <span className="chip">В пути: {formatMinutes(totalTravelMinutes)}</span>
          <span className="chip">Дистанция: {totalDistanceKm.toFixed(1)} км</span>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Маршрут</h3>
        </div>
        <div className="section-inner grid gap-4">
          {stops.map(({ stop, place }, idx) => (
            <div key={place.slug} className="grid gap-4">
              <Link href={`/places/${place.slug}`} className="card card-link">
                <div className="flex gap-4 items-start">
                  <div className="h-20 w-20 overflow-hidden rounded-md border-neutral">
                    <img
                      src={place.images?.[0] ?? "/images/placeholder-1.svg"}
                      alt={place.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">Остановка {idx + 1}</p>
                    <h3 className="mt-2 text-h3">{place.title}</h3>
                    <p className="text-sm text-soft">{place.city} · {place.country}</p>
                    {stop.description ? (
                      <p className="mt-3 text-sm text-muted">{stop.description}</p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <span className="card-chevron">→</span>
                </div>
              </Link>

              {stop.travelToNext ? (
                <Link
                  href={`/tours/${tour.slug}/day/${day.day}/travel/${idx}`}
                  className="card card-link"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="tour">
                      <ModeIcon mode={stop.travelToNext.mode} />
                    </Badge>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-primary">Переезд</p>
                      <p className="text-sm text-muted">
                        {formatMode(stop.travelToNext.mode)} · {stop.travelToNext.durationMinutes} мин
                        {stop.travelToNext.distanceKm
                          ? ` · ${stop.travelToNext.distanceKm} км`
                          : ""}
                      </p>
                      <p className="text-xs text-soft mt-2">Что увидим по пути</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <span className="card-chevron">→</span>
                  </div>
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Отзыв о дне</h3>
        </div>
        <div className="section-inner">
          <FeedbackSection
            title="Отзыв о дне"
            buttonLabel="Оставить отзыв"
            payload={{ target: "day", tour_slug: tour.slug, day_number: day.day }}
          />
        </div>
      </section>
    </main>
  );
}
