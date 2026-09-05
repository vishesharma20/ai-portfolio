import { emptyResumeData, ResumeData } from "@/types/resume";
import { generateId, stripHyphens, humanizeSlug } from "@/lib/utils";

const GITHUB_API = "https://api.github.com";

export class GithubImportError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

/**
 * Accepts a bare username ("octocat"), an "@octocat", or a pasted profile /
 * repo URL ("https://github.com/octocat", "github.com/octocat/hello-world")
 * and returns just the username. Throws if nothing usable is found.
 */
export function extractGithubUsername(input: string): string {
  const trimmed = input.trim().replace(/^@/, "");
  if (!trimmed) throw new GithubImportError("Enter a GitHub username or profile URL.", 400);

  let candidate = trimmed;
  if (/github\.com/i.test(trimmed)) {
    const withScheme = trimmed.match(/^https?:\/\//i) ? trimmed : `https://${trimmed}`;
    try {
      const url = new URL(withScheme);
      candidate = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } catch {
      candidate = trimmed.split("github.com/")[1]?.split("/")[0] ?? "";
    }
  }

  candidate = candidate.trim();
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(candidate)) {
    throw new GithubImportError("That doesn't look like a valid GitHub username.", 400);
  }
  return candidate;
}

interface GithubUser {
  login: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  twitter_username: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
}

interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  created_at: string;
  pushed_at: string;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function fetchGithubUser(username: string): Promise<GithubUser> {
  const res = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) {
    throw new GithubImportError(`No GitHub user named "${username}" was found.`, 404);
  }
  if (res.status === 403) {
    throw new GithubImportError(
      "GitHub's rate limit was hit. Try again in a few minutes, or set GITHUB_TOKEN to raise the limit.",
      429
    );
  }
  if (!res.ok) throw new GithubImportError("GitHub lookup failed.", 502);
  return res.json();
}

async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&direction=desc`,
    { headers: authHeaders(), cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

interface PinnedRepo {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  primaryLanguage: { name: string } | null;
  repositoryTopics: { nodes: { topic: { name: string } }[] };
  createdAt: string;
}

/** Pinned repos aren't exposed by the REST API — only GraphQL, which needs a token. Best effort. */
async function fetchPinnedRepos(username: string): Promise<PinnedRepo[] | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  try {
    const res = await fetch(`${GITHUB_API}/graphql`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query($login: String!) {
          user(login: $login) {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name description url homepageUrl stargazerCount createdAt
                  primaryLanguage { name }
                  repositoryTopics(first: 5) { nodes { topic { name } } }
                }
              }
            }
          }
        }`,
        variables: { login: username },
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const nodes = json?.data?.user?.pinnedItems?.nodes;
    return Array.isArray(nodes) && nodes.length > 0 ? nodes : null;
  } catch {
    return null;
  }
}

const FRONTEND_LANGS = new Set(["JavaScript", "TypeScript", "HTML", "CSS", "Vue", "Svelte"]);
const BACKEND_LANGS = new Set(["Python", "Go", "Java", "Ruby", "PHP", "C#", "Rust", "Kotlin", "Elixir", "Scala"]);
const MOBILE_LANGS = new Set(["Swift", "Dart", "Objective-C"]);

/** Best-effort professional title from the language mix, since GitHub has no "job title" field. */
function inferTitle(languageCounts: Map<string, number>): string {
  const top = [...languageCounts.entries()].sort((a, b) => b[1] - a[1]).map(([lang]) => lang);
  const hasFrontend = top.some((l) => FRONTEND_LANGS.has(l));
  const hasBackend = top.some((l) => BACKEND_LANGS.has(l));
  const hasMobile = top.some((l) => MOBILE_LANGS.has(l));

  if (hasMobile && !hasFrontend && !hasBackend) return "Mobile Developer";
  if (hasFrontend && hasBackend) return "Full Stack Developer";
  if (hasFrontend) return "Frontend Developer";
  if (hasBackend) return "Backend Developer";
  return "Software Developer";
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function projectFromRepo(repo: {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  createdAt: string;
}) {
  return {
    id: generateId(),
    title: humanizeSlug(repo.name),
    description: stripHyphens(repo.description ?? ""),
    tags: [repo.language, ...repo.topics].filter((t): t is string => Boolean(t)).slice(0, 5),
    link: repo.homepage ? normalizeUrl(repo.homepage) : repo.url,
    year: repo.createdAt ? String(new Date(repo.createdAt).getFullYear()) : "",
  };
}

/**
 * Single entry point: fetch a public GitHub profile + repos and map them
 * into ResumeData. Uses only unauthenticated public REST endpoints by
 * default (no login required from the visitor). If a server-side
 * GITHUB_TOKEN is configured, also pulls the user's actual pinned repos via
 * GraphQL and gets a much higher rate limit; without one, falls back to the
 * most-starred non-fork repos, which works fine for the vast majority of
 * profiles.
 */
export async function importFromGithub(
  usernameOrUrl: string
): Promise<{ data: ResumeData; pinnedRepos: boolean; repoCount: number }> {
  const username = extractGithubUsername(usernameOrUrl);
  const [user, repos, pinned] = await Promise.all([
    fetchGithubUser(username),
    fetchGithubRepos(username),
    fetchPinnedRepos(username),
  ]);

  const realRepos = repos.filter((r) => !r.fork && !r.archived);

  const languageCounts = new Map<string, number>();
  for (const repo of realRepos) {
    if (!repo.language) continue;
    languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
  }
  const skills = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang)
    .slice(0, 10);

  const projects = pinned
    ? pinned.map((p) =>
        projectFromRepo({
          name: p.name,
          description: p.description,
          url: p.url,
          homepage: p.homepageUrl,
          language: p.primaryLanguage?.name ?? null,
          topics: p.repositoryTopics.nodes.map((n) => n.topic.name),
          createdAt: p.createdAt,
        })
      )
    : [...realRepos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6)
        .map((r) =>
          projectFromRepo({
            name: r.name,
            description: r.description,
            url: r.html_url,
            homepage: r.homepage,
            language: r.language,
            topics: r.topics ?? [],
            createdAt: r.created_at,
          })
        );

  const links = [
    { id: generateId(), label: "GitHub", url: user.html_url },
    ...(user.blog ? [{ id: generateId(), label: "Website", url: normalizeUrl(user.blog) }] : []),
    ...(user.twitter_username
      ? [{ id: generateId(), label: "Twitter", url: `https://twitter.com/${user.twitter_username}` }]
      : []),
  ];

  const data: ResumeData = {
    ...emptyResumeData,
    name: user.name ? stripHyphens(user.name) : user.login,
    title: inferTitle(languageCounts),
    summary: user.bio ? stripHyphens(user.bio) : "",
    email: user.email ?? "",
    location: user.location ? stripHyphens(user.location) : "",
    skills,
    projects,
    links,
    photoUrl: user.avatar_url,
  };

  return { data, pinnedRepos: Boolean(pinned), repoCount: realRepos.length };
}
