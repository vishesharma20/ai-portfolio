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

/** ISO timestamp -> "2 hours ago" / "just now" / "3 days ago", for dashboard "last edited" labels. */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/** "my-cool_app" -> "My Cool App". Used to turn repo slugs into display titles. */
export function humanizeSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => (word === word.toUpperCase() ? word : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}
