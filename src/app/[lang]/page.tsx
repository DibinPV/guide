import Link from "next/link";
import { getLanguages, getLocations, getLocationMeta } from "@/lib/content";

export async function generateStaticParams() {
  const languages = await getLanguages();
  return languages.map((lang) => ({ lang }));
}

export default async function LanguagePage({
  params
}: {
  params: { lang: string };
}) {
  const locations = await getLocations(params.lang);
  const enriched = await Promise.all(
    locations.map(async (slug) => ({
      slug,
      meta: await getLocationMeta(params.lang, slug)
    }))
  );

  return (
    <main className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-moss">Language</p>
        <h2 className="text-2xl font-display">{params.lang.toUpperCase()}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {enriched.map(({ slug, meta }) => (
          <Link
            key={slug}
            href={`/${params.lang}/${slug}`}
            className="rounded-2xl border border-black/10 bg-white/70 p-5 hover:shadow-md transition"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-moss">{meta.country}</p>
            <h3 className="text-lg font-display">{meta.title}</h3>
            <p className="text-sm text-black/60">{meta.tags?.join(" · ")}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
