import { getGroqClient, GROQ_TEXT_MODEL } from "./groq-client";
import { mockParseResume } from "./mock-resume-parser";
import { emptyResumeData, resumeDataSchema, ResumeData } from "@/types/resume";
import { generateId, stripHyphens } from "@/lib/utils";

/** Runs stripHyphens across every prose field. URLs and IDs are left untouched. */
function sanitizeResumeData(data: ResumeData): ResumeData {
  return {
    ...data,
    name: stripHyphens(data.name),
    title: stripHyphens(data.title),
    summary: stripHyphens(data.summary),
    location: stripHyphens(data.location),
    skills: data.skills.map(stripHyphens),
    experience: data.experience.map((e) => ({
      ...e,
      role: stripHyphens(e.role),
      company: stripHyphens(e.company),
      description: stripHyphens(e.description),
      highlights: e.highlights.map(stripHyphens),
    })),
    education: data.education.map((e) => ({
      ...e,
      school: stripHyphens(e.school),
      degree: stripHyphens(e.degree),
      field: stripHyphens(e.field),
    })),
    projects: data.projects.map((p) => ({
      ...p,
      title: stripHyphens(p.title),
      description: stripHyphens(p.description),
      tags: p.tags.map(stripHyphens),
    })),
    links: data.links.map((l) => ({ ...l, label: stripHyphens(l.label) })),
  };
}

const EXTRACTION_SYSTEM_PROMPT = `You extract structured resume data from raw resume text.
Return ONLY a JSON object with this exact shape (no markdown, no commentary):
{
  "name": string,
  "title": string,
  "summary": string,
  "email": string,
  "phone": string,
  "location": string,
  "skills": string[],
  "experience": [{ "role": string, "company": string, "location": string, "startDate": string, "endDate": string, "description": string, "highlights": string[] }],
  "education": [{ "school": string, "degree": string, "field": string, "startDate": string, "endDate": string }],
  "projects": [{ "title": string, "description": string, "tags": string[], "link": string, "year": string }],
  "links": [{ "label": string, "url": string }]
}
Infer a professional "title" (e.g. "Senior Product Designer") from the resume if not explicit.
Keep "summary" to 2-3 sentences, rewritten cleanly.
Do not use hyphens or dashes anywhere in any generated text (title, summary, descriptions, highlights). Never write hyphenated compound adjectives like "detail-oriented" or "results-driven" — rephrase without the hyphen instead (e.g. "detail oriented", "focused on results"). Never use em dashes or en dashes as punctuation either.
Omit fields you can't find as empty strings/arrays.`;

async function extractResumeWithGroq(rawText: string): Promise<ResumeData | null> {
  const client = getGroqClient();
  if (!client) return null;

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_TEXT_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: rawText.slice(0, 12000) },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const withIds = {
      ...parsed,
      experience: (parsed.experience ?? []).map((e: object) => ({ id: generateId(), ...e })),
      education: (parsed.education ?? []).map((e: object) => ({ id: generateId(), ...e })),
      projects: (parsed.projects ?? []).map((p: object) => ({ id: generateId(), ...p })),
      links: (parsed.links ?? []).map((l: object) => ({ id: generateId(), ...l })),
    };

    const result = resumeDataSchema.safeParse({ ...emptyResumeData, ...withIds });
    return result.success ? result.data : null;
  } catch (err) {
    console.error("[resume-extraction] Groq extraction failed, falling back to mock:", err);
    return null;
  }
}

/**
 * Single entry point every call site should use. Tries Groq first (if
 * configured), and transparently falls back to the deterministic mock
 * parser so the product always works end to end. Every result is sanitized
 * the same way regardless of source.
 */
export async function extractResumeData(rawText: string): Promise<{ data: ResumeData; usedAi: boolean }> {
  const aiResult = await extractResumeWithGroq(rawText);
  if (aiResult) return { data: sanitizeResumeData(aiResult), usedAi: true };
  return { data: sanitizeResumeData(mockParseResume(rawText)), usedAi: false };
}
