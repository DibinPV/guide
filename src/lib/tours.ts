import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

export type TravelInfo = {
  mode: "walk" | "bus" | "car" | "metro" | "train" | "plane";
  durationMinutes: number;
  distanceKm?: number;
  notes?: string;
};

export type TourStop = {
  place: string;
  description?: string;
  passBy?: string;
  travelToNext?: TravelInfo;
};

export type TourDay = {
  day: number;
  title: string;
  stops: TourStop[];
};

export type Tour = {
  slug: string;
  title: string;
  city?: string;
  country?: string;
  days: TourDay[];
};

const TOURS_ROOT = path.join(process.cwd(), "content", "ru", "tours");

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function getTourSlugs() {
  if (!(await exists(TOURS_ROOT))) return [];
  const entries = await fs.readdir(TOURS_ROOT, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function getTour(slug: string): Promise<Tour> {
  const file = path.join(TOURS_ROOT, slug, "tour.json");
  const raw = await fs.readFile(file, "utf8");
  const data = JSON.parse(raw) as Omit<Tour, "slug">;
  return { slug, ...data };
}

export async function getAllTours() {
  const slugs = await getTourSlugs();
  const tours = await Promise.all(slugs.map((slug) => getTour(slug)));
  return tours;
}
