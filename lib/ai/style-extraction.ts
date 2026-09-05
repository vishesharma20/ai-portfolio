import { getGroqClient, GROQ_VISION_MODEL } from "./groq-client";
import { mockAnalyzeInspiration } from "./mock-style-analyzer";
import { defaultDesignTokens, designTokensSchema, DesignTokens } from "@/types/design-tokens";

const STYLE_SYSTEM_PROMPT = `You are a design system analyst. Given an inspiration image, derive a design
token set. Return ONLY a JSON object with this exact shape:
{
  "primaryColor": "#hex",
  "accentColor": "#hex",
  "backgroundColor": "#hex",
  "surfaceColor": "#hex",
  "typographyStyle": "modern-sans" | "classic-serif" | "geometric" | "monospace-technical",
  "layoutDensity": "airy" | "balanced" | "dense",
  "borderRadius": number (0-32),
  "mood": "minimal" | "bold" | "editorial" | "playful" | "luxury" | "technical",
  "animationIntensity": number (0-100)
}
Colors must be real hex values sampled from / inspired by the image's palette. backgroundColor should stay dark.`;

async function analyzeWithGroq(imageDataUrl: string): Promise<DesignTokens | null> {
  const client = getGroqClient();
  if (!client) return null;

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_VISION_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: STYLE_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this inspiration image and derive design tokens." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const result = designTokensSchema.safeParse({ ...defaultDesignTokens, ...JSON.parse(raw) });
    return result.success ? result.data : null;
  } catch (err) {
    console.error("[style-extraction] Groq vision analysis failed, falling back to mock:", err);
    return null;
  }
}

export async function analyzeInspirationImage(
  imageDataUrl: string | null
): Promise<{ tokens: DesignTokens; usedAi: boolean }> {
  if (!imageDataUrl) return { tokens: defaultDesignTokens, usedAi: false };

  const aiResult = await analyzeWithGroq(imageDataUrl);
  if (aiResult) return { tokens: aiResult, usedAi: true };

  return { tokens: mockAnalyzeInspiration(imageDataUrl.slice(0, 256)), usedAi: false };
}
