import Link from "next/link";
import { getPlace } from "@/lib/places";
import FeedbackSection from "@/components/FeedbackSection";
import { getTourBySlugDb, getTourDayWithEventsDb, getTourDaysDb } from "@/lib/toursDb";

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

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours <= 0) return `${minutes} мин`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}

export default async function TourDayPage({ params }: { params: { slug: string; day: string } }) {
  const tour = await getTourBySlugDb(params.slug);
  if (!tour) {
    return (
      <main>
        <section className="page-hero">
          <p className="page-kicker">День</p>
          <h2 className="page-title mt-2">Тур не найден</h2>
        </section>
      </main>
    );
  }

  const dayNum = Number(params.day);
  const day = await getTourDayWithEventsDb(tour.id, dayNum);
  const allDays = await getTourDaysDb(tour.id);
  const dayIndex = allDays.findIndex((item) => item.day_number === dayNum);
  const prevDay = dayIndex > 0 ? allDays[dayIndex - 1] : null;
  const nextDay = dayIndex < allDays.length - 1 ? allDays[dayIndex + 1] : null;

  if (!day) {
    return (
      <main>
        <section className="page-hero">
          <p className="page-kicker">День</p>
          <h2 className="page-title mt-2">День не найден</h2>
        </section>
      </main>
    );
  }

  const slugSet = new Set<string>();
  day.events.forEach((event) => {
    if (event.place_slug) slugSet.add(event.place_slug);
    if (event.from_place_slug) slugSet.add(event.from_place_slug);
    if (event.to_place_slug) slugSet.add(event.to_place_slug);
  });

  const placeEntries = await Promise.all(
    Array.from(slugSet).map(async (slug) => {
      try {
        const place = await getPlace(slug);
        return { slug, place };
      } catch {
        return { slug, place: null };
      }
    })
  );
  const placeMap = new Map(placeEntries.map(({ slug, place }) => [slug, place]));

  const totalTravelMinutes = day.events
    .filter((event) => event.type === "travel")
    .reduce((sum, event) => sum + event.duration_minutes, 0);
  const totalMinutes = day.events.reduce((sum, event) => sum + event.duration_minutes, 0);

  return (
    <main>
      <section className="page-hero">
        <p className="page-kicker">День {day.day_number}</p>
        <h2 className="page-title mt-2">{day.title}</h2>
        <div className="day-nav">
          <Link className="text-xs text-soft hover:underline" href={`/tours/${tour.slug}`}>
            ← Назад к туру
          </Link>
          {prevDay ? (
            <Link className="text-xs text-soft hover:underline" href={`/tours/${tour.slug}/day/${prevDay.day_number}`}>
              ← День {prevDay.day_number}
            </Link>
          ) : <span />}
          {nextDay ? (
            <Link className="text-xs text-soft hover:underline" href={`/tours/${tour.slug}/day/${nextDay.day_number}`}>
              День {nextDay.day_number} →
            </Link>
          ) : <span />}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Итоги дня</h3>
        </div>
        <div className="section-inner day-meta-grid">
          <div className="day-meta-card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Событий</p>
            <h4 className="mt-2 text-h3">{day.events.length}</h4>
          </div>
          <div className="day-meta-card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">В пути</p>
            <h4 className="mt-2 text-h3">{formatMinutes(totalTravelMinutes)}</h4>
          </div>
          <div className="day-meta-card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Длительность дня</p>
            <h4 className="mt-2 text-h3">{formatMinutes(totalMinutes)}</h4>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Хронология</h3>
        </div>
        <div className="section-inner timeline">
          {day.events.map((event, index) => {
            const excursionPlace = event.place_slug ? placeMap.get(event.place_slug) : null;
            const fromPlace = event.from_place_slug ? placeMap.get(event.from_place_slug) : null;
            const toPlace = event.to_place_slug ? placeMap.get(event.to_place_slug) : null;
            return (
              <div key={event.id} className="timeline-item">
                <div className="timeline-time">
                  <div className="timeline-time-pill">{event.start_time}</div>
                  <div className="text-xs text-soft mt-2">{formatMinutes(event.duration_minutes)}</div>
                </div>
                <div className="timeline-marker">
                  <span className="timeline-dot" />
                  {index < day.events.length - 1 ? <span className="timeline-line" /> : null}
                </div>
                <Link
                  href={`/tours/${tour.slug}/day/${day.day_number}/event/${event.id}`}
                  className="timeline-card"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`timeline-badge ${event.type === "travel" ? "travel" : event.type === "pause" ? "pause" : ""}`}>
                      {event.type === "excursion" ? "ЭКСКУРСИЯ" : event.type === "travel" ? "ПЕРЕЕЗД" : "ПЕРЕРЫВ"}
                    </span>
                    {event.type === "travel" && event.mode ? (
                      <span className="chip">{formatMode(event.mode)}</span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-h3">{event.title}</h3>
                  {event.summary ? (
                    <p className="text-sm text-muted mt-2 timeline-summary">{event.summary}</p>
                  ) : null}
                  {event.type === "excursion" ? (
                    <p className="text-sm text-soft mt-2">
                      {excursionPlace ? `${excursionPlace.title} · ${excursionPlace.city}` : event.place_slug || "Без места"}
                    </p>
                  ) : event.type === "travel" ? (
                    <p className="text-sm text-soft mt-2">
                      {fromPlace ? fromPlace.title : event.from_place_slug || "Откуда"} → {toPlace ? toPlace.title : event.to_place_slug || "Куда"}
                    </p>
                  ) : (
                    <p className="text-sm text-soft mt-2">Свободное время</p>
                  )}
                  <div className="mt-3 event-cta">Читать историю →</div>
                </Link>
              </div>
            );
          })}
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
            payload={{ target: "day", tour_slug: tour.slug, day_number: day.day_number }}
          />
        </div>
      </section>
    </main>
  );
}
