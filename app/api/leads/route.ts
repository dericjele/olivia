import { NextRequest, NextResponse } from "next/server";
import { saveLead, leadExists } from "@/lib/leads";
import { sendLeadAlert } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      contact,
      journey,
      score,
      lang,
      notes,
    } = body;

    // Validate — contact is the only required field
    if (!contact || typeof contact !== "string" || contact.trim().length < 2) {
      return NextResponse.json({ error: "Invalid contact" }, { status: 400 });
    }

    // Pull traffic source from URL param stored by client
    const source = body.source ?? null;

    const lead = {
      contact: contact.trim(),
      journey: journey ?? null,
      score:   typeof score === "number" ? score : undefined,
      source,
      lang:    lang ?? "en",
      notes:   notes ?? null,
    };

    // Save to Supabase
    const result = await saveLead(lead);

    // Fire email alert — non-blocking, never fails the request
    const isNew = !(await leadExists(contact.trim()).catch(() => false));
    if (isNew || !result) {
      sendLeadAlert(lead).catch(() => {});
    }

    return NextResponse.json({ ok: true, id: result?.id ?? null });
  } catch (err) {
    console.error("[/api/leads] error:", err);
    // Return ok anyway — never block the user over a lead save failure
    return NextResponse.json({ ok: true });
  }
}
