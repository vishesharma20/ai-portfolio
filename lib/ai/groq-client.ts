import OpenAI from "openai";

let client: OpenAI | null = null;

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

/**
 * Groq exposes an OpenAI-compatible API, so we reuse the official OpenAI SDK
 * and just point it at Groq's base URL + key. Lazily instantiated; returns
 * null when no key is configured, which every call site uses as the signal
 * to fall back to the mock AI layer.
 */
export function getGroqClient(): OpenAI | null {
  if (!isGroqConfigured()) return null;
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return client;
}

// Groq's model lineup changes fairly often (see console.groq.com/docs/models).
// Centralized here so an upgrade is a one-line change.
export const GROQ_TEXT_MODEL = "openai/gpt-oss-120b"; // production text/JSON-mode model
export const GROQ_VISION_MODEL = "qwen/qwen3.6-27b"; // current multimodal (vision + JSON mode) model
