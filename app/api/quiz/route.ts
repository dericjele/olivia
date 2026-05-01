import { NextRequest, NextResponse } from "next/server";
import { generateQuizInsight } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { score, answers } = await req.json();
    if (typeof score !== "number" || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const result = await generateQuizInsight(score, answers);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Quiz insight error:", err);
    return NextResponse.json({ error: "Failed to generate insight." }, { status: 500 });
  }
}
