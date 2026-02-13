import Link from "next/link";
import { getLanguages, getLocations, getLocationMeta } from "@/lib/content";

export default async function HomePage() {
  const languages = await getLanguages();
  const blocks = await Promise.all(
    languages.map(async (lang) => {
      const locations = await getLocations(lang);
      const enriched = await Promise.all(
        locations.map(async (slug) => ({
          slug,
          meta: await getLocationMeta(lang, slug)
        }))
      );
      return { lang, locations: enriched };
    })
  );

  return (
    <main className="grid gap-8">
      <section className="grid gap-3">
        <h2 className="text-2xl md:text-3xl font-display">Discover places offline</h2>
        <p className="max-w-2xl text-base text-black/70">
          A lightweight travel guide that works without signal. Add to Home Screen, cache the
          content, and explore with local tips.
        </p>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <Link
              key={lang}
              href={`/${lang}`}
              className="px-4 py-2 rounded-full bg-moss text-white text-sm"
            >
              {lang.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>

      {blocks.map(({ lang, locations }) => (
        <section key={lang} className="grid gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display">{lang.toUpperCase()}</h3>
            <Link className="text-sm underline" href={`/${lang}`}>
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {locations.map(({ slug, meta }) => (
              <Link
                key={slug}
                href={`/${lang}/${slug}`}
                className="rounded-2xl border border-black/10 bg-white/70 p-5 hover:shadow-md transition"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-moss">{meta.country}</p>
                <h4 className="text-lg font-display">{meta.title}</h4>
                <p className="text-sm text-black/60">{meta.tags?.join(" · ")}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
