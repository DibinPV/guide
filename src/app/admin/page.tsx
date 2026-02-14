import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminDashboardPage() {
  return (
    <main>
      <section className="admin-page-head">
        <div className="admin-page-title-wrap">
          <div className="admin-page-title-row">
            <Link href="/" className="admin-title-brand" aria-label="На главную">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48" role="img">
                  <defs>
                    <linearGradient id="brandGradientAdminDash" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#5f7763" />
                      <stop offset="100%" stopColor="#2f5e50" />
                    </linearGradient>
                  </defs>
                  <circle cx="24" cy="24" r="22" fill="none" stroke="url(#brandGradientAdminDash)" strokeWidth="2.6" />
                  <path
                    d="M24 10c-4 0-7.2 3.2-7.2 7.2 0 5.2 7.2 15.6 7.2 15.6s7.2-10.4 7.2-15.6C31.2 13.2 28 10 24 10z"
                    fill="url(#brandGradientAdminDash)"
                  />
                  <circle cx="24" cy="17.2" r="3.4" fill="#f7f2ee" />
                  <path
                    d="M12 34c4.2-3 8.8-4.6 12-4.6S31.8 31 36 34"
                    fill="none"
                    stroke="#1f3d34"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </Link>
            <div>
              <h1 className="admin-page-title">Дашборд</h1>
              <div className="admin-page-sub">
                <span>Админка</span>
                <span>·</span>
                <span>Быстрые действия</span>
              </div>
            </div>
          </div>
          <div className="admin-page-actions">
            <AdminNav />
          </div>
        </div>
      </section>
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
