import { getWikiCache, putWikiCache } from "../storage/db";
import type { WikipediaCacheEntry } from "../storage/schema";

const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type WikipediaResult = WikipediaCacheEntry & { fromCache: boolean };

type WikiUrlParts = {
  host: string;
  lang: string;
  title: string;
};

function parseWikipediaUrl(url: string): WikiUrlParts | null {
  try {
    const u = new URL(url);
    const m = u.host.match(/^(\w+)\.wikipedia\.org$/);
    if (!m) return null;
    const lang = m[1];
    const match = u.pathname.match(/^\/wiki\/(.+)$/);
    if (!match) return null;
    const title = decodeURIComponent(match[1]);
    return { host: u.host, lang, title };
  } catch {
    return null;
  }
}

type SummaryResponse = {
  title?: string;
  extract?: string;
  extract_html?: string;
  description?: string;
  lang?: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
};

export async function fetchWikipediaSummary(
  url: string,
  options: { force?: boolean } = {},
): Promise<WikipediaResult | null> {
  const parts = parseWikipediaUrl(url);
  if (!parts) return null;

  if (!options.force) {
    const cached = await getWikiCache(url);
    if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
      return { ...cached, fromCache: true };
    }
  }

  const apiUrl = `https://${parts.host}/api/rest_v1/page/summary/${encodeURIComponent(parts.title)}`;
  const res = await fetch(apiUrl, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Wikipedia-Anfrage fehlgeschlagen (${res.status})`);
  const data = (await res.json()) as SummaryResponse;

  const entry: WikipediaCacheEntry = {
    url,
    title: data.title ?? parts.title.replace(/_/g, " "),
    extract: data.extract ?? "",
    extractHtml: data.extract_html ?? "",
    description: data.description,
    lang: data.lang ?? parts.lang,
    thumbnail: data.thumbnail,
    originalImage: data.originalimage,
    pageUrl: data.content_urls?.desktop?.page ?? url,
    fetchedAt: Date.now(),
  };
  await putWikiCache(entry);
  return { ...entry, fromCache: false };
}
