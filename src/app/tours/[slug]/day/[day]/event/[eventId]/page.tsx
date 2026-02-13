import Link from "next/link";
import { remark } from "remark";
import html from "remark-html";
import { getTourBySlugDb, getTourDayWithEventsDb } from "@/lib/toursDb";
import ArticleGallery from "@/components/article/ArticleGallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours <= 0) return `${minutes} мин`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}

export default async function TourEventPage({
  params
}: {
  params: { slug: string; day: string; eventId: string };
}) {
  const tour = await getTourBySlugDb(params.slug);
  if (!tour) {
    return (
      <main>
        <section className="page-hero">
          <p className="page-kicker">Событие</p>
          <h2 className="page-title mt-2">Тур не найден</h2>
        </section>
      </main>
    );
  }

  const dayNum = Number(params.day);
  const day = await getTourDayWithEventsDb(tour.id, dayNum);
  if (!day) {
    return (
      <main>
        <section className="page-hero">
          <p className="page-kicker">Событие</p>
          <h2 className="page-title mt-2">День не найден</h2>
        </section>
      </main>
    );
  }

  const event = day.events.find((item) => item.id === params.eventId);
  if (!event) {
    return (
      <main>
        <section className="page-hero">
          <p className="page-kicker">Событие</p>
          <h2 className="page-title mt-2">Событие не найдено</h2>
        </section>
      </main>
    );
  }

  const article = event.article;
  const processed = article?.content_md
    ? await remark().use(html).process(article.content_md)
    : null;
  const htmlContent = processed ? String(processed) : "";
  const images = article?.images || [];
  const heroImage = images[0];
  const gallery = images.slice(1);

  return (
    <main>
      <section className="page-hero">
        <p className="page-kicker">Событие</p>
        <h2 className="page-title mt-2">{event.title}</h2>
        {event.summary ? <p className="page-subtitle mt-2">{event.summary}</p> : null}
        <Link
          className="text-xs text-soft hover:underline mt-2 inline-block"
          href={`/tours/${tour.slug}/day/${day.day_number}`}
        >
          Назад к дню
        </Link>
      </section>

      {heroImage ? (
        <section className="section">
          <div className="article-hero">
            <img src={heroImage} alt={event.title} />
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="article-layout">
          <div className="article-body">
            <ArticleGallery images={images} title={event.title} />
            <article className="article-shell">
              {article?.lead ? <p className="article-lead">{article.lead}</p> : null}
              {htmlContent ? (
                <div className="prose max-w-none mt-6" dangerouslySetInnerHTML={{ __html: htmlContent }} />
              ) : (
                <p className="text-sm text-muted">Пока нет статьи для этого события.</p>
              )}
            </article>

            {gallery.length > 0 ? (
              <section className="section">
                <div className="section-header">
                  <span className="section-marker" />
                  <h3 className="text-h3">Галерея</h3>
                </div>
                <div className="section-inner article-gallery">
                  {gallery.map((src) => (
                    <div key={src} className="article-gallery-card">
                      <img src={src} alt={event.title} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="article-aside">
            <div className="article-aside-card">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Кратко о событии</p>
              <div className="article-meta">
                <div className="article-meta-card">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">Тип</p>
                  <h4 className="mt-2 text-h3">
                    {event.type === "excursion" ? "Экскурсия" : "Перемещение"}
                  </h4>
                </div>
                <div className="article-meta-card">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">Время</p>
                  <h4 className="mt-2 text-h3">{event.start_time}</h4>
                </div>
                <div className="article-meta-card">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">Длительность</p>
                  <h4 className="mt-2 text-h3">{formatMinutes(event.duration_minutes)}</h4>
                </div>
              </div>
              {event.summary ? (
                <>
                  <div className="article-divider" />
                  <p className="text-sm text-muted">{event.summary}</p>
                </>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
