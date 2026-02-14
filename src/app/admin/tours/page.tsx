import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminToursPage() {
  noStore();
  let tours: Array<{
    id: string;
    slug: string;
    title: string;
    city: string | null;
    country: string | null;
    is_published: boolean;
    updated_at: string;
  }> = [];
  let error: string | null = null;

  try {
    const { data, error: queryError } = await supabaseAdmin
      .from("tours")
      .select("id,slug,title,city,country,is_published,updated_at")
      .order("updated_at", { ascending: false });

    if (queryError) {
      error = queryError.message;
    } else {
      tours = data ?? [];
    }
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <main>
      <section className="admin-page-head">
        <div className="admin-page-title-wrap">
          <div className="admin-page-title-row">
            <Link href="/" className="admin-title-brand" aria-label="На главную">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48" role="img">
                  <defs>
                    <linearGradient id="brandGradientAdminTours" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#5f7763" />
                      <stop offset="100%" stopColor="#2f5e50" />
                    </linearGradient>
                  </defs>
                  <circle cx="24" cy="24" r="22" fill="none" stroke="url(#brandGradientAdminTours)" strokeWidth="2.6" />
                  <path
                    d="M24 10c-4 0-7.2 3.2-7.2 7.2 0 5.2 7.2 15.6 7.2 15.6s7.2-10.4 7.2-15.6C31.2 13.2 28 10 24 10z"
                    fill="url(#brandGradientAdminTours)"
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
              <h1 className="admin-page-title">Туры</h1>
              <div className="admin-page-sub">
                <span>Админка</span>
                <span>·</span>
                <span>Создавайте и редактируйте маршруты</span>
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
          <h3 className="text-h3">Все туры</h3>
          <Link href="/admin/tours/new" className="button-primary ml-auto">
            Добавить тур
          </Link>
        </div>
        <div className="section-inner grid gap-4">
          {error ? (
            <div className="card">
              <p className="text-sm text-muted">Ошибка загрузки: {error}</p>
            </div>
          ) : null}
          {(tours ?? []).map((tour) => (
            <Link key={tour.id} href={`/admin/tours/${tour.id}`} className="card card-link">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary-60">
                    {tour.city} · {tour.country}
                  </p>
                  <h3 className="mt-2 text-h3">{tour.title}</h3>
                  <p className="text-sm text-soft mt-1">Slug: {tour.slug}</p>
                </div>
                <span className="card-chevron">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
