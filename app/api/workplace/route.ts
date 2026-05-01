import { NextRequest, NextResponse } from "next/server";
import { generateWorkplaceGuidance } from "../../../lib/ai";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  try {
    const { situationId } = await req.json();

    if (!situationId || typeof situationId !== "string") {
      return NextResponse.json({ error: "Invalid situation" }, { status: 400 });
    }

    const result = await generateWorkplaceGuidance(situationId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Workplace guidance error:", err);
    return NextResponse.json({ error: "Failed to generate guidance." }, { status: 500 });
  }
}
