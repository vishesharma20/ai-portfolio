import { generateId } from "@/lib/utils";
import { emptyResumeData, ResumeData } from "@/types/resume";

const SECTION_HEADERS: Record<string, RegExp> = {
  summary: /^(summary|about|profile|objective)s?$/i,
  experience: /^(experience|work experience|employment( history)?)$/i,
  education: /^education$/i,
  skills: /^(skills|technical skills|core competencies)$/i,
  projects: /^projects?$/i,
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
const URL_RE = /(https?:\/\/[^\s,]+|(?:www\.)[^\s,]+\.[a-z]{2,}[^\s,]*)/gi;
const YEAR_RANGE_RE = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4})\s*(?:-|–|to)\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4}|present|current)/i;

function splitIntoSections(lines: string[]) {
  const sections: Record<string, string[]> = {};
  let current = "preamble";
  sections[current] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const matchedKey = Object.entries(SECTION_HEADERS).find(([, re]) => re.test(line));
    if (matchedKey && line.length < 40) {
      current = matchedKey[0];
      sections[current] = sections[current] ?? [];
      continue;
    }
    sections[current].push(rawLine);
  }
  return sections;
}

function extractLinks(text: string) {
  const found = Array.from(new Set(text.match(URL_RE) ?? []));
  return found.slice(0, 6).map((url) => {
    const clean = url.replace(/[.,]+$/, "");
    let label = "Website";
    if (/linkedin/i.test(clean)) label = "LinkedIn";
    else if (/github/i.test(clean)) label = "GitHub";
    else if (/behance/i.test(clean)) label = "Behance";
    else if (/dribbble/i.test(clean)) label = "Dribbble";
    return { id: generateId(), label, url: clean.startsWith("http") ? clean : `https://${clean}` };
  });
}

function chunkByBlankLines(lines: string[]): string[][] {
  const chunks: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (line.trim() === "") {
      if (current.length) chunks.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length) chunks.push(current);
  return chunks;
}

function parseExperience(lines: string[]) {
  return chunkByBlankLines(lines)
    .slice(0, 6)
    .map((chunk) => {
      const header = chunk[0] ?? "";
      const dateMatch = header.match(YEAR_RANGE_RE) ?? chunk.join(" ").match(YEAR_RANGE_RE);
      const headerWithoutDate = header.replace(YEAR_RANGE_RE, "").trim();
      const [rolePart, companyPart] = headerWithoutDate.split(/ at | – | - |,/i);

      return {
        id: generateId(),
        role: (rolePart || headerWithoutDate || "Role").trim(),
        company: (companyPart || "").trim(),
        location: "",
        startDate: dateMatch ? `${dateMatch[1] ?? ""}${dateMatch[2]}`.trim() : "",
        endDate: dateMatch ? (dateMatch[3] ?? dateMatch[4] ?? "Present").trim() : "Present",
        description: chunk.slice(1).join(" ").trim(),
        highlights: chunk
          .slice(1)
          .filter((l) => /^[-•*]/.test(l.trim()))
          .map((l) => l.replace(/^[-•*]\s*/, "").trim()),
      };
    })
    .filter((e) => e.role);
}

function parseEducation(lines: string[]) {
  return chunkByBlankLines(lines)
    .slice(0, 4)
    .map((chunk) => {
      const header = chunk[0] ?? "";
      const dateMatch = header.match(YEAR_RANGE_RE);
      const headerClean = header.replace(YEAR_RANGE_RE, "").trim();
      const [school, degree] = headerClean.split(/,| – | - /);
      return {
        id: generateId(),
        school: (school || headerClean || "").trim(),
        degree: (degree || chunk[1] || "").trim(),
        field: "",
        startDate: dateMatch ? dateMatch[2] ?? "" : "",
        endDate: dateMatch ? dateMatch[4] ?? "" : "",
      };
    })
    .filter((e) => e.school);
}

function parseProjects(lines: string[]) {
  return chunkByBlankLines(lines)
    .slice(0, 6)
    .map((chunk) => ({
      id: generateId(),
      title: (chunk[0] || "").trim(),
      description: chunk.slice(1).join(" ").trim(),
      tags: [],
      link: "",
      year: "",
    }))
    .filter((p) => p.title);
}

function parseSkills(lines: string[]) {
  return lines
    .join(",")
    .split(/[,•|\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40)
    .slice(0, 24);
}

/**
 * Best-effort heuristic resume parser. This is intentionally a "mock AI" —
 * no ML involved — so the full product flow works with zero configuration.
 * Swap this out for `extractResumeWithOpenAi` once OPENAI_API_KEY is set.
 */
export function mockParseResume(rawText: string): ResumeData {
  const text = rawText.replace(/\r/g, "");
  const lines = text.split("\n");
  const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);

  const email = text.match(EMAIL_RE)?.[0] ?? "";
  const phone = text.match(PHONE_RE)?.[0] ?? "";
  const links = extractLinks(text);

  const name = nonEmpty[0]?.replace(EMAIL_RE, "").trim() || "Your Name";
  const title =
    nonEmpty[1] && nonEmpty[1].length < 70 && !EMAIL_RE.test(nonEmpty[1]) ? nonEmpty[1] : "Your Title";

  const sections = splitIntoSections(lines);

  const summary = (sections.summary ?? []).join(" ").trim().slice(0, 600);
  const skills = parseSkills(sections.skills ?? []);
  const experience = parseExperience(sections.experience ?? []);
  const education = parseEducation(sections.education ?? []);
  const projects = parseProjects(sections.projects ?? []);

  return {
    ...emptyResumeData,
    name,
    title,
    summary,
    email,
    phone,
    location: "",
    skills,
    experience,
    education,
    projects,
    links,
  };
}
