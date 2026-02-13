import Link from "next/link";
import { getAllPlaces, getPlace } from "@/lib/places";
import FeedbackSection from "@/components/FeedbackSection";

export async function generateStaticParams() {
  const places = await getAllPlaces();
  return places.map((place) => ({ slug: place.slug }));
}

export default async function PlacePage({ params }: { params: { slug: string } }) {
  const place = await getPlace(params.slug);

  return (
    <main>
      <section className="page-hero">
        <p className="page-kicker">Локация</p>
        <div className="mt-2 text-xs uppercase tracking-[0.2em] text-primary-60">
          {place.city} · {place.country}
        </div>
        <h2 className="page-title mt-2">{place.title}</h2>
        <Link className="text-xs text-soft hover:underline mt-2 inline-block" href="/places">
          Назад к списку
        </Link>
      </section>

      <section className="section">
        <article className="card">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: place.html }} />
        </article>
      </section>

      {place.images && place.images.length > 0 ? (
        <section className="section">
          <div className="section-header">
            <span className="section-marker" />
            <h3 className="text-h3">Галерея</h3>
          </div>
          <div className="section-inner grid gap-4 md:grid-cols-2">
            {place.images.map((src) => (
              <div key={src} className="card p-0 overflow-hidden">
                <img src={src} alt={place.title} className="h-56 w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Отзыв о месте</h3>
        </div>
        <div className="section-inner">
          <FeedbackSection
            title="Отзыв о месте"
            buttonLabel="Оставить отзыв"
            payload={{
              target: "place",
              place_slug: place.slug
            }}
          />
        </div>
      </section>
    </main>
  );
}
