import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type Place = {
  slug: string;
  title: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  images?: string[];
  html: string;
};

const PLACES_ROOT = path.join(process.cwd(), "content", "ru", "places");

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function getPlaceSlugs() {
  if (!(await exists(PLACES_ROOT))) return [];
  const entries = await fs.readdir(PLACES_ROOT, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name.replace(/\.md$/, ""));
}

export async function getPlace(slug: string): Promise<Place> {
  const file = path.join(PLACES_ROOT, `${slug}.md`);
  const raw = await fs.readFile(file, "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);
  return {
    slug,
    title: data.title as string,
    city: data.city as string | undefined,
    country: data.country as string | undefined,
    lat: data.lat as number | undefined,
    lng: data.lng as number | undefined,
    images: data.images as string[] | undefined,
    html: processed.toString()
  };
}

export async function getAllPlaces() {
  const slugs = await getPlaceSlugs();
  const places = await Promise.all(slugs.map((slug) => getPlace(slug)));
  return places;
}
