import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Strips hyphens/dashes from text. Applied to every AI-or-API-sourced text
 * field regardless of origin (resume extraction, GitHub import) so the
 * generated portfolio never renders "detail-oriented" / em-dash punctuation.
 */
export function stripHyphens(text: string): string {
  return text.replace(/[\u2010-\u2015\u2212-]/g, " ").replace(/\s{2,}/g, " ").trim();
}

/** "my-cool_app" -> "My Cool App". Used to turn repo slugs into display titles. */
export function humanizeSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => (word === word.toUpperCase() ? word : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}
