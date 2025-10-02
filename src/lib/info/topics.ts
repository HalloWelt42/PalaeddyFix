import { marked } from "marked";

export type InfoTopic = {
  key: string;
  title: string;
  subtitle?: string;
  markdown: string;
  html: string;
};

marked.setOptions({
  gfm: true,
  breaks: false,
});

function parseFrontmatter(source: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: source };
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (key) meta[key] = value;
    }
  }
  return { meta, body: match[2] };
}

const rawFiles = import.meta.glob("./topics/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const topics: Record<string, InfoTopic> = {};

for (const [path, source] of Object.entries(rawFiles)) {
  const key = path.replace(/^.*\//, "").replace(/\.md$/, "");
  const { meta, body } = parseFrontmatter(source);
  const html = marked.parse(body) as string;
  topics[key] = {
    key,
    title: meta.title ?? key,
    subtitle: meta.subtitle,
    markdown: body.trim(),
    html,
  };
}

export function getTopic(key: string): InfoTopic | null {
  return topics[key] ?? null;
}

export function listTopics(): InfoTopic[] {
  return Object.values(topics);
}

export function topicAsPlainText(topic: InfoTopic): string {
  const head = topic.subtitle
    ? `${topic.title}\n${topic.subtitle}\n\n`
    : `${topic.title}\n\n`;
  return (head + topic.markdown).trim() + "\n";
}
