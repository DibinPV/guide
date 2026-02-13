import Link from "next/link";
import { getLanguages, getLocations, getSections, getPage } from "@/lib/content";

export async function generateStaticParams() {
  const languages = await getLanguages();
  const params = [] as { lang: string; slug: string }[];
  for (const lang of languages) {
    const locations = await getLocations(lang);
    for (const slug of locations) params.push({ lang, slug });
  }
  return params;
}

export default async function LocationPage({
  params
}: {
  params: { lang: string; slug: string };
}) {
  const sections = await getSections(params.lang, params.slug);
  const overview = await getPage(params.lang, params.slug, "index");

  return (
    <main className="grid gap-6">
      <section className="rounded-3xl border border-black/10 bg-white/80 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-moss">{overview.frontMatter.country}</p>
        <h2 className="text-3xl font-display mb-4">{overview.frontMatter.title}</h2>
        <article
          className="prose max-w-none text-black/80"
          dangerouslySetInnerHTML={{ __html: overview.html }}
        />
      </section>

      <section className="grid gap-3">
        <h3 className="text-xl font-display">Sections</h3>
        <div className="flex flex-wrap gap-2">
          {sections
            .filter((s) => s !== "index")
            .map((section) => (
              <Link
                key={section}
                href={`/${params.lang}/${params.slug}/${section}`}
                className="px-4 py-2 rounded-full border border-black/10 bg-white/60"
              >
                {section}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
