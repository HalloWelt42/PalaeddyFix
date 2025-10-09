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

function absolutizeHtml(html: string, host: string): string {
  return html.replace(/(href|src)="(\/[^"]+)"/g, (_m, attr, value) => {
    if (value.startsWith("//")) return `${attr}="https:${value}"`;
    return `${attr}="https://${host}${value}"`;
  });
}

const STRIP_SELECTORS = [
  "script",
  "style",
  "link",
  "meta",
  ".mw-editsection",
  ".noprint",
  ".mw-empty-elt",
  ".navbox",
  ".vertical-navbox",
  ".catlinks",
  ".sistersitebox",
  ".printfooter",
  "#toc",
  ".toc",
  ".mw-references-wrap",
  ".reflist",
  ".references",
  ".hatnote",
  ".shortdescription",
  "table.metadata",
  ".infobox.sisterproject",
];

function cleanWikipediaHtml(rawHtml: string, host: string): string {
  if (typeof DOMParser === "undefined") return absolutizeHtml(rawHtml, host);
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  for (const sel of STRIP_SELECTORS) {
    for (const el of Array.from(doc.querySelectorAll(sel))) {
      el.remove();
    }
  }
  for (const a of Array.from(doc.querySelectorAll("a[href]"))) {
    const href = a.getAttribute("href") ?? "";
    if (href.startsWith("/") && !href.startsWith("//")) {
      a.setAttribute("href", `https://${host}${href}`);
    }
    if (href.startsWith("#")) {
      a.removeAttribute("href");
    }
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  }
  for (const img of Array.from(doc.querySelectorAll("img[src]"))) {
    const src = img.getAttribute("src") ?? "";
    if (src.startsWith("//")) img.setAttribute("src", `https:${src}`);
    else if (src.startsWith("/")) img.setAttribute("src", `https://${host}${src}`);
    img.setAttribute("loading", "lazy");
    img.removeAttribute("srcset");
  }
  const body = doc.body;
  if (!body) return absolutizeHtml(rawHtml, host);
  const firstSection = body.querySelector("section[data-mw-section-id]");
  const contentRoot = firstSection?.parentElement ?? body;
  return contentRoot.innerHTML;
}

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

  const encodedTitle = encodeURIComponent(parts.title);
  const summaryUrl = `https://${parts.host}/api/rest_v1/page/summary/${encodedTitle}`;
  const htmlUrl = `https://${parts.host}/api/rest_v1/page/html/${encodedTitle}`;

  const [summaryRes, htmlRes] = await Promise.all([
    fetch(summaryUrl, { headers: { accept: "application/json" } }),
    fetch(htmlUrl, { headers: { accept: "text/html" } }),
  ]);

  if (!summaryRes.ok) {
    throw new Error(`Wikipedia-Anfrage fehlgeschlagen (${summaryRes.status})`);
  }
  const summary = (await summaryRes.json()) as SummaryResponse;

  let articleHtml = "";
  if (htmlRes.ok) {
    const rawHtml = await htmlRes.text();
    articleHtml = cleanWikipediaHtml(rawHtml, parts.host);
  }

  const entry: WikipediaCacheEntry = {
    url,
    title: summary.title ?? parts.title.replace(/_/g, " "),
    extract: summary.extract ?? "",
    extractHtml: summary.extract_html ?? "",
    articleHtml,
    description: summary.description,
    lang: summary.lang ?? parts.lang,
    thumbnail: summary.thumbnail,
    originalImage: summary.originalimage,
    pageUrl: summary.content_urls?.desktop?.page ?? url,
    fetchedAt: Date.now(),
  };
  await putWikiCache(entry);
  return { ...entry, fromCache: false };
}
