import { NextRequest, NextResponse } from "next/server";
import { buildQuizInsight } from "@/lib/quiz";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const { score, answers } = await req.json();
    if (typeof score !== "number" || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    // Pure logic — no AI call
    const result = buildQuizInsight(score, answers);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Quiz insight error:", err);
    return NextResponse.json(
      { error: "Failed to generate insight." },
      { status: 500 }
    );
  }
}
