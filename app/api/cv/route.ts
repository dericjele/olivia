import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, parseFormFile } from "@/lib/extract";
import { analyseCV } from "@/lib/ai";
import { saveLead } from "@/lib/leads";
import { sendLeadAlert } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { file, text } = await parseFormFile(req);

    let cvText = "";

    if (file && file.size > 0) {
      try {
        cvText = await extractTextFromFile(file);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Could not read file";
        return NextResponse.json({ error: message }, { status: 422 });
      }
    } else if (text && text.trim().length > 40) {
      cvText = text.trim();
    } else {
      return NextResponse.json(
        { error: "Please upload a file or paste your CV text." },
        { status: 400 }
      );
    }

    if (cvText.length < 40) {
      return NextResponse.json(
        { error: "CV appears to be too short. Please check your file or text." },
        { status: 400 }
      );
    }

    // Analyse — ECE-optimised prompt, no file saved
    const result = await analyseCV(cvText);
    return NextResponse.json(result);

  } catch (err) {
    console.error("CV analysis error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
