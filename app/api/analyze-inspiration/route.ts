import { NextRequest, NextResponse } from "next/server";
import { analyzeInspirationImage } from "@/lib/ai/style-extraction";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl } = (await req.json()) as { imageDataUrl: string | null };
    const { tokens, usedAi } = await analyzeInspirationImage(imageDataUrl);
    return NextResponse.json({ tokens, usedAi });
  } catch (err) {
    console.error("[api/analyze-inspiration]", err);
    return NextResponse.json({ error: "Failed to analyze inspiration image" }, { status: 500 });
  }
}
