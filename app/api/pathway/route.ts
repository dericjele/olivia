import { NextRequest, NextResponse } from "next/server";
import { generatePathway } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  try {
    const answers = await req.json();

    if (!answers.qual_country || !answers.qual_level || !answers.nz_experience) {
      return NextResponse.json({ error: "Incomplete answers" }, { status: 400 });
    }

    const result = await generatePathway(answers);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Pathway error:", err);
    return NextResponse.json({ error: "Failed to generate pathway." }, { status: 500 });
  }
}
