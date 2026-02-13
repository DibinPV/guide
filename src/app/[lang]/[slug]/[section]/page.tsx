import Link from "next/link";
import { getLanguages, getLocations, getSections, getPage } from "@/lib/content";

export async function generateStaticParams() {
  const languages = await getLanguages();
  const params = [] as { lang: string; slug: string; section: string }[];
  for (const lang of languages) {
    const locations = await getLocations(lang);
    for (const slug of locations) {
      const sections = await getSections(lang, slug);
      for (const section of sections) {
        if (section === "index") continue;
        params.push({ lang, slug, section });
      }
    }
  }
  return params;
}

export default async function SectionPage({
  params
}: {
  params: { lang: string; slug: string; section: string };
}) {
  const page = await getPage(params.lang, params.slug, params.section);

  return (
    <main className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-moss">{page.frontMatter.country}</p>
          <h2 className="text-2xl font-display">{page.frontMatter.title}</h2>
        </div>
        <Link className="text-sm underline" href={`/${params.lang}/${params.slug}`}>
          Back to overview
        </Link>
      </div>

      <article
        className="prose max-w-none text-black/80"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </main>
  );
}
