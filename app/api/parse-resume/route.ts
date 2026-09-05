import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/parse/pdf";
import { extractTextFromDocx } from "@/lib/parse/docx";
import { extractResumeData } from "@/lib/ai/resume-extraction";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx =
      file.type.includes("wordprocessingml") || file.name.toLowerCase().endsWith(".docx");

    let rawText = "";
    if (isPdf) {
      rawText = await extractTextFromPdf(buffer);
    } else if (isDocx) {
      rawText = await extractTextFromDocx(buffer);
    } else {
      rawText = buffer.toString("utf-8");
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "We couldn't extract any text from that file." },
        { status: 422 }
      );
    }

    const { data, usedAi } = await extractResumeData(rawText);
    return NextResponse.json({ data, usedAi });
  } catch (err) {
    console.error("[api/parse-resume]", err);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
