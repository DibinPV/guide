import Link from "next/link";
import { getAllTours } from "@/lib/tours";
import { getAllPlaces } from "@/lib/places";
import { ButtonLink } from "@/ui/ButtonLink";
import { Badge } from "@/ui/Badge";

export default async function HomePage() {
  const tours = await getAllTours();
  const places = await getAllPlaces();

  return (
    <main>
      <section className="text-center">
        <div className="mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Современный travel</p>
          <h2 className="hero-title mx-auto mt-3">Маршруты, которые работают оффлайн</h2>
          <p className="hero-subtitle mx-auto mt-4">
            Планируйте день, сохраняйте маршруты и открывайте историю мест даже без интернета.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/tours" variant="primary">
            Смотреть туры
          </ButtonLink>
          <ButtonLink href="/places" variant="secondary">
            Список локаций
          </ButtonLink>
        </div>
        <p className="microcopy">Работает без интернета • Карты и тексты оффлайн</p>

        <div className="section-inner mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-3">
          <div className="feature-card text-left">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-60" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h16M6 12a6 6 0 1112 0" />
              </svg>
              <h3 className="feature-title">Доступ без сети</h3>
            </div>
            <p className="text-sm text-muted mt-2">Заранее загрузите маршрут и описание мест.</p>
          </div>
          <div className="feature-card text-left">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-60" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
              <h3 className="feature-title">Сценарий по шагам</h3>
            </div>
            <p className="text-sm text-muted mt-2">Переезды, остановки и подсказки по пути.</p>
          </div>
          <div className="feature-card text-left">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-60" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5h14v14H5z" />
                <path d="M9 9h6M9 13h6" />
              </svg>
              <h3 className="feature-title">Глубина контента</h3>
            </div>
            <p className="text-sm text-muted mt-2">Короткие факты и исторический контекст.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Популярные туры</h3>
          <Link className="text-xs text-soft hover:underline ml-auto" href="/tours">
            Все туры
          </Link>
        </div>
        <div className="section-inner grid gap-4 md:grid-cols-2">
          {tours.map((tour) => (
            <Link key={tour.slug} href={`/tours/${tour.slug}`} className="card card-link">
              <div className="card-tour__gradient" />
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-primary">
                  {tour.city} · {tour.country}
                </div>
                <Badge variant="tour">ТУР</Badge>
              </div>
              <h4 className="mt-3 text-h3">{tour.title}</h4>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-soft">⏱ {tour.days.length} дня</p>
                <span className="card-chevron">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Локации</h3>
          <Link className="text-xs text-soft hover:underline ml-auto" href="/places">
            Все локации
          </Link>
        </div>
        <div className="section-inner grid gap-4 md:grid-cols-2">
          {places.map((place) => (
            <Link key={place.slug} href={`/places/${place.slug}`} className="card card-link">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-primary">
                  {place.city} · {place.country}
                </div>
                <Badge variant="place">МЕСТО</Badge>
              </div>
              <h4 className="mt-3 text-h3">{place.title}</h4>
              <div className="mt-2 flex items-center justify-end">
                <span className="card-chevron">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Карта</h3>
          <Link className="text-xs text-soft hover:underline ml-auto" href="/map">
            Смотреть карту
          </Link>
        </div>
        <div className="section-inner">
          <Link href="/map" className="map-preview card-link flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted">Смотреть маршрут на карте</p>
              <span className="mt-2 inline-flex items-center gap-2 button-primary text-sm">
                Открыть карту →
              </span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
