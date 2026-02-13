import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main>
      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Быстрые действия</h3>
        </div>
        <div className="section-inner grid gap-4 md:grid-cols-2">
          <Link href="/admin/tours/new" className="card card-link">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary-60">Создать</p>
                <h3 className="mt-2 text-h3">Новый тур</h3>
                <p className="text-sm text-soft mt-1">Добавить маршрут и остановки.</p>
              </div>
              <span className="card-chevron">→</span>
            </div>
          </Link>
          <Link href="/admin/tours" className="card card-link">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary-60">Просмотр</p>
                <h3 className="mt-2 text-h3">Список туров</h3>
                <p className="text-sm text-soft mt-1">Редактировать существующие.</p>
              </div>
              <span className="card-chevron">→</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
