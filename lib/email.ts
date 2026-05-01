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

const SCORE_BAND = (score?: number) => {
  if (!score) return "";
  if (score >= 68) return `${score} — Strong ✅`;
  if (score >= 45) return `${score} — Mid ⚠️`;
  return `${score} — Needs work 🔴`;
};

/**
 * Send an instant lead alert to Olivia.
 * Fire-and-forget — never blocks the user response.
 */
export async function sendLeadAlert(lead: LeadInsert): Promise<void> {
  if (!TO) {
    console.warn("[email] LEAD_NOTIFICATION_EMAIL not set — skipping alert");
    return;
  }

  const journey = JOURNEY_LABELS[lead.journey ?? ""] ?? lead.journey ?? "Unknown";
  const score   = SCORE_BAND(lead.score);
  const source  = lead.source ? `post: ${lead.source}` : "direct";
  const lang    = lead.lang === "zh" ? "Chinese 🇨🇳" : "English 🇳🇿";
  const notes   = lead.notes ? JSON.stringify(lead.notes, null, 2) : "—";
  const time    = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <div style="background:#F5A800;border-radius:12px;padding:20px 24px;margin-bottom:24px">
        <h1 style="margin:0;font-size:22px;color:#111">🔔 New Lead</h1>
        <p style="margin:6px 0 0;color:#333;font-size:14px">${time} NZT</p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:12px 0;color:#666;width:140px">Contact</td>
          <td style="padding:12px 0;font-weight:600;color:#111">${lead.contact}</td>
        </tr>
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:12px 0;color:#666">Journey</td>
          <td style="padding:12px 0;color:#111">${journey}</td>
        </tr>
        ${score ? `
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:12px 0;color:#666">Score</td>
          <td style="padding:12px 0;color:#111">${score}</td>
        </tr>` : ""}
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:12px 0;color:#666">Language</td>
          <td style="padding:12px 0;color:#111">${lang}</td>
        </tr>
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:12px 0;color:#666">Source</td>
          <td style="padding:12px 0;color:#111">${source}</td>
        </tr>
        ${lead.notes ? `
        <tr>
          <td style="padding:12px 0;color:#666;vertical-align:top">Details</td>
          <td style="padding:12px 0;color:#111">
            <pre style="margin:0;font-size:12px;background:#f5f5f5;padding:10px;border-radius:6px;white-space:pre-wrap">${notes}</pre>
          </td>
        </tr>` : ""}
      </table>

      <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#666">
        <a href="${APP_URL}" style="color:#F5A800;font-weight:600;text-decoration:none">
          View in Supabase Dashboard →
        </a>
      </div>
    </div>
  `;

  try {
    const { error } = await getResend().emails.send({
      from:    FROM,
      to:      TO,
      subject: `🔔 New Lead — ${journey} (${lead.contact})`,
      html,
    });

    if (error) {
      console.error("[email] resend error:", error);
    }
  } catch (err) {
    // Never throw — email failure should never break the user flow
    console.error("[email] unexpected error:", err);
  }
}
