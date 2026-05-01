import { NextRequest, NextResponse } from "next/server";
import { saveLead } from "@/lib/leads";
import { sendLeadAlert } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contact, journey, score, lang, notes, source,
      city, nz_duration, employed, heard_from,
      booking_need, booking_timeline,
    } = body;

    if (!contact || typeof contact !== "string" || contact.trim().length < 2) {
      return NextResponse.json({ error: "Invalid contact" }, { status: 400 });
    }

    const lead = {
      contact:          contact.trim(),
      journey:          journey          ?? undefined,
      score:            typeof score === "number" ? score : undefined,
      source:           source           ?? undefined,
      lang:             lang             ?? "en",
      city:             city             ?? undefined,
      nz_duration:      nz_duration      ?? undefined,
      employed:         employed         ?? undefined,
      heard_from:       heard_from       ?? undefined,
      booking_need:     booking_need     ?? undefined,
      booking_timeline: booking_timeline ?? undefined,
      notes:            notes            ?? undefined,
    };

    const result = await saveLead(lead);

    // Fire-and-forget email — never blocks response
    sendLeadAlert(lead).catch(() => {});

    return NextResponse.json({ ok: true, id: result?.id ?? null });
  } catch (err) {
    console.error("[/api/leads] error:", err);
    return NextResponse.json({ ok: true });
  }
}
