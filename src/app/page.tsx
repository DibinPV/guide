import Link from "next/link";
import { getTourFirstEventTitles, getTourSummaries, getToursDb } from "@/lib/toursDb";
import { Badge } from "@/ui/Badge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const tours = await getToursDb();
  const tourSummaries = await getTourSummaries(tours.map((tour) => tour.id));
  const firstEventTitles = await getTourFirstEventTitles(tours.map((tour) => tour.id));

  return (
    <main>
      <section className="hero-shell">
        <div className="hero-layout">
          <div className="text-left">
            <p className="hero-kicker">Современный travel</p>
            <h2 className="hero-title mt-3">Оффлайн путеводитель по маршрутам</h2>
            <p className="hero-subtitle mt-4">
              Готовые дни, события и истории — всё в одном месте.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tours" className="cta-main">
                Смотреть туры →
              </Link>
            </div>
            <div className="micro-stats">
              <span>
                Маршрутов: <strong>{tours.length}</strong>
              </span>
              <span>
                <strong>100%</strong> оффлайн
              </span>
            </div>
          </div>
          <div className="hero-preview">
            <div className="hero-preview-card">
              <p className="text-xs uppercase tracking-[0.2em] text-primary-60">Маршрут дня</p>
              <h3 className="mt-2 text-h3">Каппадокия</h3>
              <div className="mt-4 grid gap-2">
                <div className="hero-preview-row">09:00 · Гёреме</div>
                <div className="hero-preview-row">11:20 · Учисар</div>
                <div className="hero-preview-row">14:10 · Деринкую</div>
              </div>
              <div className="hero-preview-map" />
            </div>
          </div>
        </div>

        <div className="section-inner mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-3">
          <div className="feature-card text-left">
            <div className="flex items-center gap-2">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M3 12l7-2 6-6 2 2-6 6-2 7-7-7z" />
                <path d="M10 14l-4 4" />
              </svg>
              <h3 className="feature-title">Доступ без сети</h3>
            </div>
            <p className="text-sm text-muted mt-2">Загрузите карту маршрута и осмотрите места.</p>
          </div>
          <div className="feature-card text-left">
            <div className="flex items-center gap-2">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M4 12a8 8 0 1 0 2-5.5" />
                <path d="M4 4v4h4" />
              </svg>
              <h3 className="feature-title">Следуй по шагам</h3>
            </div>
            <p className="text-sm text-muted mt-2">Проходите точки и получайте подсказки по пути.</p>
          </div>
          <div className="feature-card text-left">
            <div className="flex items-center gap-2">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 4h12v14a2 2 0 0 1-2 2H6z" />
                <path d="M9 8h6M9 12h6" />
              </svg>
              <h3 className="feature-title">Глубина контекста</h3>
            </div>
            <p className="text-sm text-muted mt-2">Короткие факты и исторический контекст.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="section-title">Популярные туры</h3>
          <Link className="text-xs text-soft hover:underline ml-auto" href="/tours">
            Все туры →
          </Link>
        </div>
        <div className="section-inner grid gap-5">
          {tours.map((tour) => {
            const summary = tourSummaries.get(tour.id) || { days: 0, events: 0, minutes: 0 };
            const firstEvent = firstEventTitles.get(tour.id);
            return (
              <Link key={tour.slug} href={`/tours/${tour.slug}`} className="card card-link tour-card">
                <div className="tour-media">
                  <img src={tour.cover_url || "/images/placeholder-1.svg"} alt={`Тур ${tour.title}`} />
                  <span className="tour-duration">Оффлайн тур</span>
                </div>
                <div>
                  <div className="tour-meta">
                    <div className="text-xs uppercase tracking-[0.2em] text-primary-60">
                      {tour.city} · {tour.country}
                    </div>
                    <Badge variant="tour" className="badge-soft">ТУР</Badge>
                  </div>
                  <h4 className="mt-3 text-h2">{tour.title}</h4>
                  <p className="text-sm text-soft mt-2">{tour.summary || "Маршрут с ключевыми остановками и заметками по пути."}</p>
                  {firstEvent ? (
                    <p className="text-sm text-muted mt-2">Первое событие: {firstEvent}</p>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted">
                      {summary.days} дней · {summary.events} событий · {Math.max(1, Math.round(summary.minutes / 60))} ч
                    </span>
                    <span className="card-chevron">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="section-title">Как это работает</h3>
        </div>
        <div className="section-inner grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-60">Шаг 1</p>
            <h4 className="mt-2 text-h3">Выберите тур</h4>
            <p className="text-sm text-soft mt-2">Откройте маршрут и изучите события по дням.</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-60">Шаг 2</p>
            <h4 className="mt-2 text-h3">Сохраните</h4>
            <p className="text-sm text-soft mt-2">Материалы загружаются на устройство.</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-60">Шаг 3</p>
            <h4 className="mt-2 text-h3">Путешествуйте оффлайн</h4>
            <p className="text-sm text-soft mt-2">Читайте истории и следуйте по маршруту без сети.</p>
          </div>
        </div>
      </section>

    </main>
  );
}
