import { supabase } from "@/lib/supabaseClient";

type Stats = {
  count: number;
  avgRating: number | null;
  likes: number;
  dislikes: number;
};

async function getStats(table: string): Promise<Stats> {
  const { data, error } = await supabase.from(table).select("rating,is_like");

  if (error) {
    return { count: 0, avgRating: null, likes: 0, dislikes: 0 };
  }

  const rows = data || [];
  const ratings = rows.map((r) => r.rating).filter((r) => typeof r === "number") as number[];
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const likes = rows.filter((r) => r.is_like === true).length;
  const dislikes = rows.filter((r) => r.is_like === false).length;

  return {
    count: rows.length,
    avgRating,
    likes,
    dislikes
  };
}

export default async function FeedbackStatsPage() {
  const [tour, day, stop, travel, place] = await Promise.all([
    getStats("feedback_tour"),
    getStats("feedback_day"),
    getStats("feedback_stop"),
    getStats("feedback_travel"),
    getStats("feedback_place")
  ]);

  const rows = [
    { title: "Тур", stats: tour },
    { title: "День", stats: day },
    { title: "Место (в туре)", stats: stop },
    { title: "Прогулка", stats: travel },
    { title: "Место (общий)", stats: place }
  ];

  const totalCount = rows.reduce((sum, r) => sum + r.stats.count, 0);
  const totalLikes = rows.reduce((sum, r) => sum + r.stats.likes, 0);
  const totalDislikes = rows.reduce((sum, r) => sum + r.stats.dislikes, 0);
  const totalRatingSum = rows.reduce((sum, r) => {
    if (r.stats.avgRating && r.stats.count > 0) {
      return sum + r.stats.avgRating * r.stats.count;
    }
    return sum;
  }, 0);
  const totalAvg = totalCount ? totalRatingSum / totalCount : null;

  return (
    <main>
      <section className="page-hero">
        <p className="page-kicker">Отзывы</p>
        <h2 className="page-title mt-2">Статистика</h2>
        <p className="page-subtitle mt-2">Короткая сводка и разбивка по типам.</p>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Общая сводка</h3>
        </div>
        <div className="section-inner grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Всего отзывов</p>
            <h4 className="mt-3 text-h3">{totalCount}</h4>
            <p className="text-sm text-soft mt-2">Все типы отзывов</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Средняя оценка</p>
            <h4 className="mt-3 text-h3">{totalAvg ? totalAvg.toFixed(2) : "—"}</h4>
            <p className="text-sm text-soft mt-2">По всем оценкам 1–5</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Лайки / дизлайки</p>
            <h4 className="mt-3 text-h3">{totalLikes} / {totalDislikes}</h4>
            <p className="text-sm text-soft mt-2">Суммарно</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-marker" />
          <h3 className="text-h3">Разбивка по типам</h3>
        </div>
        <div className="section-inner card card-compact">
          <div className="grid grid-cols-12 text-xs text-soft uppercase tracking-[0.2em]">
            <div className="col-span-4">Тип</div>
            <div className="col-span-2">Всего</div>
            <div className="col-span-3">Средняя</div>
            <div className="col-span-3">👍 / 👎</div>
          </div>
          <div className="mt-3 grid gap-2">
            {rows.map((item) => (
              <div key={item.title} className="grid grid-cols-12 items-center">
                <div className="col-span-4 text-sm">{item.title}</div>
                <div className="col-span-2 text-sm">{item.stats.count}</div>
                <div className="col-span-3 text-sm">
                  {item.stats.avgRating ? item.stats.avgRating.toFixed(2) : "—"}
                </div>
                <div className="col-span-3 text-sm text-soft">
                  {item.stats.likes} / {item.stats.dislikes}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
