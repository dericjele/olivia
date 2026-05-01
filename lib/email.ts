import { Resend } from "resend";
import type { LeadInsert } from "./leads";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  return _resend;
}

const FROM    = process.env.RESEND_FROM             ?? "onboarding@resend.dev";
const TO      = process.env.LEAD_NOTIFICATION_EMAIL ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL     ?? "http://localhost:3000";

const JOURNEY_LABELS: Record<string, string> = {
  quiz:      "Readiness Quiz",
  cv:        "CV Analyser",
  pathway:   "TC Registration Pathway",
  interview: "Interview Bank",
  workplace: "Workplace Support",
  booking:   "Booking",
};

function row(label: string, value: unknown) {
  if (!value) return "";
  return `
    <tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:10px 0;color:#888;width:160px;font-size:13px;vertical-align:top">${label}</td>
      <td style="padding:10px 0;color:#111;font-size:13px">${value}</td>
    </tr>`;
}

function section(title: string, content: string) {
  if (!content.trim()) return "";
  return `
    <tr><td colspan="2" style="padding:16px 0 6px;font-size:11px;font-weight:600;
      letter-spacing:1.5px;text-transform:uppercase;color:#aaa">${title}</td></tr>
    ${content}`;
}

export async function sendLeadAlert(lead: LeadInsert): Promise<void> {
  if (!TO) {
    console.warn("[email] LEAD_NOTIFICATION_EMAIL not set");
    return;
  }

  const journey = JOURNEY_LABELS[lead.journey ?? ""] ?? lead.journey ?? "Unknown";
  const n       = lead.notes ?? {};
  const time    = new Date().toLocaleString("en-NZ", {
    timeZone: "Pacific/Auckland",
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Score band label
  const scoreBand = lead.score
    ? lead.score >= 68 ? `${lead.score}/100 — Strong ✅`
    : lead.score >= 45 ? `${lead.score}/100 — Mid range ⚠️`
    : `${lead.score}/100 — Needs work 🔴`
    : null;

  const html = `
  <div style="font-family:-apple-system,sans-serif;max-width:580px;margin:0 auto;padding:0">

    <!-- Header -->
    <div style="background:#F5A800;padding:20px 28px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;font-size:20px;color:#111;font-weight:700">🔔 New Lead — ${journey}</h1>
      <p style="margin:5px 0 0;color:#555;font-size:13px">${time} NZT</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:20px 28px;border-radius:0 0 12px 12px;border:1px solid #eee;border-top:none">
      <table style="width:100%;border-collapse:collapse">

        <!-- Contact -->
        ${section("Contact", `
          ${row("Contact", lead.contact)}
          ${row("Language", lead.lang === "zh" ? "Chinese 🇨🇳" : "English 🇳🇿")}
          ${row("City", lead.city)}
          ${row("Time in NZ", lead.nz_duration)}
          ${row("Currently employed", lead.employed)}
          ${row("Heard from", lead.heard_from)}
          ${row("Traffic source", lead.source ? `RedNote post: ${lead.source}` : null)}
        `)}

        <!-- Journey & Score -->
        ${section("Journey & Score", `
          ${row("Journey", journey)}
          ${row("Score", scoreBand)}
          ${row("Quiz weak areas", n.quiz_weak_areas)}
          ${row("Biggest blocker", n.biggest_blocker)}
          ${row("Recommendation", n.recommendation)}
        `)}

        <!-- CV Analysis -->
        ${n.cv_score ? section("CV Analysis", `
          ${row("CV score", scoreBand)}
          ${row("CV headline", n.cv_headline)}
          ${row("Key insight", n.cv_key_insight)}
          ${row("Gaps", n.cv_gaps)}
          ${row("Strengths", n.cv_strengths)}
          ${row("Quick wins", n.cv_quick_wins)}
          ${row("Suggested next step", n.cv_next_step)}
          ${row("File type", n.file_type)}
        `) : ""}

        <!-- Pathway -->
        ${n.pathway_type ? section("Registration Pathway", `
          ${row("Pathway type", n.pathway_type)}
          ${row("Qual country", n.qual_country)}
          ${row("Qual level", n.qual_level)}
          ${row("NZ experience", n.nz_experience)}
        `) : ""}

        <!-- Workplace -->
        ${n.workplace_situation ? section("Workplace Support", `
          ${row("Situation type", n.workplace_situation)}
        `) : ""}

        <!-- Booking Intent -->
        ${lead.booking_need ? section("Booking Intent", `
          ${row("Needs help with", lead.booking_need)}
          ${row("Timeline", lead.booking_timeline)}
        `) : ""}

      </table>

      <!-- CTA -->
      <div style="margin-top:20px;padding:14px 16px;background:#f9f9f9;border-radius:8px;font-size:13px">
        <a href="${APP_URL}" style="color:#F5A800;font-weight:600;text-decoration:none">
          View all leads in Supabase →
        </a>
      </div>
    </div>
  </div>`;

  try {
    const { error } = await getResend().emails.send({
      from:    FROM,
      to:      TO,
      subject: `🔔 ${journey} — ${lead.contact}${lead.score ? ` (${lead.score}/100)` : ""}`,
      html,
    });
    if (error) console.error("[email] resend error:", error);
  } catch (err) {
    console.error("[email] unexpected error:", err);
  }
}
