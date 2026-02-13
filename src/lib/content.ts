import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type FrontMatter = {
  title: string;
  country?: string;
  lat?: number;
  lng?: number;
  tags?: string[];
};

const CONTENT_ROOT = path.join(process.cwd(), "content");

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function getLanguages() {
  if (!(await exists(CONTENT_ROOT))) return [];
  const entries = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function getLocations(lang: string) {
  const dir = path.join(CONTENT_ROOT, lang);
  if (!(await exists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function getSections(lang: string, slug: string) {
  const dir = path.join(CONTENT_ROOT, lang, slug);
  if (!(await exists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name.replace(/\.md$/, ""));
}

export async function getPage(lang: string, slug: string, section: string) {
  const file = path.join(CONTENT_ROOT, lang, slug, `${section}.md`);
  const raw = await fs.readFile(file, "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);

  return {
    frontMatter: data as FrontMatter,
    html: processed.toString()
  };
}

export async function getLocationMeta(lang: string, slug: string) {
  const page = await getPage(lang, slug, "index");
  return page.frontMatter;
}

export async function getAllLocations() {
  const languages = await getLanguages();
  const all = [] as { lang: string; slug: string; meta: FrontMatter }[];
  for (const lang of languages) {
    const locations = await getLocations(lang);
    for (const slug of locations) {
      const meta = await getLocationMeta(lang, slug);
      all.push({ lang, slug, meta });
    }
  }
  return all.filter((item) => typeof item.meta.lat === "number" && typeof item.meta.lng === "number");
}
