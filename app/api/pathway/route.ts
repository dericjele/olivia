import { NextRequest, NextResponse } from "next/server";
import { buildPathway } from "@/lib/pathway";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const answers = await req.json();

    if (!answers.qual_country || !answers.qual_level || !answers.nz_experience) {
      return NextResponse.json({ error: "Incomplete answers" }, { status: 400 });
    }

    // Pure logic — no AI call, instant response
    const result = buildPathway(answers);
    return NextResponse.json(result);

  } catch (err) {
    console.error("Pathway error:", err);
    return NextResponse.json(
      { error: "Failed to generate pathway." },
      { status: 500 }
    );
  }
}
