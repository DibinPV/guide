import Link from "next/link";
import { getAllTours, getTour } from "@/lib/tours";
import { Badge } from "@/ui/Badge";
import FeedbackSection from "@/components/FeedbackSection";

export async function generateStaticParams() {
  const tours = await getAllTours();
  return tours.map((tour) => ({ slug: tour.slug }));
}

export default async function TourPage({ params }: { params: { slug: string } }) {
  const tour = await getTour(params.slug);

  return (
    <main>
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Тур</p>
        <h2 className="mt-2 text-h2">{tour.title}</h2>
        <p className="text-sm text-muted mt-1">
          {tour.city} · {tour.country}
        </p>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Дни маршрута</h3>
        </div>
        <div className="section-inner grid gap-3 md:grid-cols-2">
          {tour.days.map((day) => (
            <Link
              key={day.day}
              href={`/tours/${tour.slug}/day/${day.day}`}
              className="card card-link"
            >
              <div className="card-tour__gradient" />
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-primary">День {day.day}</div>
                <Badge variant="tour">ДЕНЬ</Badge>
              </div>
              <h4 className="mt-3 text-h3">{day.title}</h4>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-soft">Локаций: {day.stops.length}</p>
                <span className="card-chevron">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
