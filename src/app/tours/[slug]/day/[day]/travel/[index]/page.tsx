import Link from "next/link";
import { getAllTours, getTour } from "@/lib/tours";
import { getPlace } from "@/lib/places";
import { Badge } from "@/ui/Badge";

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

export async function generateStaticParams() {
  const tours = await getAllTours();
  const params = [] as { slug: string; day: string; index: string }[];
  for (const tour of tours) {
    for (const day of tour.days) {
      day.stops.forEach((stop, idx) => {
        if (stop.travelToNext) params.push({ slug: tour.slug, day: String(day.day), index: String(idx) });
      });
    }
  }
  return params;
}

export default async function TravelPage({
  params
}: {
  params: { slug: string; day: string; index: string };
}) {
  const tour = await getTour(params.slug);
  const dayNum = Number(params.day);
  const idx = Number(params.index);
  const day = tour.days.find((d) => d.day === dayNum);

  if (!day || !day.stops[idx] || !day.stops[idx].travelToNext) {
    return (
      <main>
        <p>Переезд не найден.</p>
      </main>
    );
  }

  const fromStop = day.stops[idx];
  const toStop = day.stops[idx + 1];
  const fromPlace = await getPlace(fromStop.place);
  const toPlace = toStop ? await getPlace(toStop.place) : null;
  const travel = fromStop.travelToNext;

  return (
    <main>
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Переезд</p>
        <h2 className="mt-2 text-h2">{fromPlace.title} → {toPlace?.title ?? "следующая точка"}</h2>
        <Link className="text-xs text-soft hover:underline mt-2 inline-block" href={`/tours/${tour.slug}/day/${day.day}`}>
          Назад к дню маршрута
        </Link>
      </section>

      <section className="section">
        <div className="card">
          <div className="flex items-center gap-3">
            <Badge variant="tour"><ModeIcon mode={travel.mode} /></Badge>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Способ</p>
              <p className="text-sm text-muted">
                {formatMode(travel.mode)} · {travel.durationMinutes} мин
                {travel.distanceKm ? ` · ${travel.distanceKm} км` : ""}
              </p>
            </div>
          </div>
          {travel.notes ? (
            <p className="text-sm text-soft mt-3">{travel.notes}</p>
          ) : null}
        </div>
      </section>

      {fromStop.passBy ? (
        <section className="section">
          <div className="card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Что увидим по пути</p>
            <p className="text-sm text-muted mt-2">{fromStop.passBy}</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
