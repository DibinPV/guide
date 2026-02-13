import Link from "next/link";
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
      <section className="page-hero">
        <p className="page-kicker">Админка</p>
        <h2 className="page-title mt-2">Туры</h2>
        <p className="page-subtitle mt-2">Создавайте и редактируйте маршруты.</p>
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
