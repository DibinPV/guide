import Link from "next/link";
import { Badge } from "@/ui/Badge";
import FeedbackSection from "@/components/FeedbackSection";
import { getTourBySlugDb, getTourDayWithEventsDb } from "@/lib/toursDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function TravelPage({
  params
}: {
  params: { slug: string; day: string; index: string };
}) {
  const tour = await getTourBySlugDb(params.slug);
  if (!tour) {
    return (
      <main>
        <p>Переезд не найден.</p>
      </main>
    );
  }

  const dayNum = Number(params.day);
  const day = await getTourDayWithEventsDb(tour.id, dayNum);
  const idx = Number(params.index);
  const travelEvents = day?.events.filter((event) => event.type === "travel") ?? [];
  const travel = travelEvents[idx];

  if (!day || !travel) {
    return (
      <main>
        <p>Переезд не найден.</p>
      </main>
    );
  }

  return (
    <main>
      <section className="page-hero">
        <p className="page-kicker">Переезд</p>
        <h2 className="page-title mt-2">{travel.title}</h2>
        <Link className="text-xs text-soft hover:underline mt-2 inline-block" href={`/tours/${tour.slug}/day/${day.day_number}`}>
          Назад к дню маршрута
        </Link>
      </section>

      <section className="section">
        <div className="card">
          <div className="flex items-center gap-3">
            <Badge variant="tour"><ModeIcon mode={travel.mode || ""} /></Badge>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Способ</p>
              <p className="text-sm text-muted">
                {travel.mode ? formatMode(travel.mode) : "перемещение"} · {travel.duration_minutes} мин
              </p>
            </div>
          </div>
          {travel.summary ? (
            <p className="text-sm text-soft mt-3">{travel.summary}</p>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Отзыв о прогулке</h3>
        </div>
        <div className="section-inner">
          <FeedbackSection
            title="Отзыв о прогулке"
            buttonLabel="Оставить отзыв"
            payload={{
              target: "travel",
              tour_slug: tour.slug,
              day_number: day.day_number,
              travel_index: idx
            }}
          />
        </div>
      </section>
    </main>
  );
}
