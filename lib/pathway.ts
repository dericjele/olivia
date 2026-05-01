import type { PathwayResult, PathwayStep } from "./ai";

interface PathwayAnswers {
  qual_country:  string;
  qual_level:    string;
  nz_experience: string;
}

/**
 * Build a TC registration pathway from 3 answers.
 * Pure logic — no AI, no network calls, instant.
 * Matches exact option values from lib/data.ts PATHWAY_QUESTIONS.
 */
export function buildPathway(answers: PathwayAnswers): PathwayResult {
  const country = answers.qual_country ?? "";
  const level   = answers.qual_level   ?? "";
  const nzExp   = answers.nz_experience ?? "";

  // Match exact strings from data.ts opts
  const isNZ       = country === "New Zealand";
  const isBachelor = level   === "Bachelor degree or higher";
  const isDiploma3 = level   === "Diploma (3 years)";
  const isDiploma2 = level   === "Diploma (2 years or less)";
  const isCertOnly = level   === "Certificate only";
  const hasNZMore  = nzExp   === "Yes — more than 6 months";
  const hasNZLess  = nzExp   === "Yes — less than 6 months";
  const hasNZExp   = hasNZMore || hasNZLess;
  const noExp      = nzExp   === "No ECE work experience";
  const isChina    = country === "China";

  // ── NZ-TRAINED ──────────────────────────────────────────
  if (isNZ) {
    if (isCertOnly || isDiploma2) {
      return {
        complexity: "moderate",
        summary:
          "Your NZ qualification does not yet meet the minimum Teaching Council requirement of a 3-year diploma. You will need to complete further study before applying for registration.",
        warning:
          "A certificate or 2-year diploma alone is not enough for Teacher Registration. You must complete at least a 3-year ECE diploma or equivalent before applying.",
        steps: [
          step(1, "Confirm Your Qualification Gap",
            "Contact your provider or the Teaching Council (teachingcouncil.nz) to confirm exactly how many more credits or years of study you need to meet the Level 6 diploma requirement.",
            "active", "1–2 weeks"),
          step(2, "Enrol in a Top-Up Programme",
            "NZ polytechnics including Unitec, AUT and Open Polytechnic offer part-time top-up programmes for working ECE teachers. Many can be completed while you continue working.",
            "upcoming", "6–18 months"),
          step(3, "Apply to the Teaching Council",
            "Once qualified, submit your application at teachingcouncil.nz with your qualification documents, identity verification, and two referee details.",
            "upcoming", "4–8 weeks"),
          step(4, "Receive Registration and APC",
            "Most NZ-trained graduates receive Full Registration. You must then renew your Annual Practising Certificate (APC) every year to legally work in ECE.",
            "upcoming", "Ongoing"),
        ],
      };
    }

    return {
      complexity: "straightforward",
      summary:
        `Your NZ ${isBachelor ? "degree" : "3-year diploma"} meets Teaching Council requirements. Your path to registration is straightforward — the main steps are application, verification and receiving your Annual Practising Certificate.`,
      warning: hasNZMore
        ? undefined
        : "Confirm your specific qualification is on the Teaching Council's approved qualifications list before starting your application.",
      steps: [
        step(1, "Check the Approved Qualifications List",
          "Confirm your qualification is on the Teaching Council's approved list at teachingcouncil.nz/qualifications. This takes 5 minutes and avoids surprises later.",
          "active", "Same day"),
        step(2, "Create a Teaching Council Account",
          "Register at teachingcouncil.nz. You'll need a valid NZ address, identity documents (passport or birth certificate + proof of address), and your academic transcripts.",
          "upcoming", "1–2 days"),
        step(3, "Submit Your Registration Application",
          "Complete the online application. You'll need two referees who can speak to your professional ECE practice — ideally a placement supervisor or centre director.",
          "upcoming", "2–4 weeks to process"),
        step(4, "Receive Registration and Annual Practising Certificate",
          "Once approved you receive Full Registration and your first APC. You must renew the APC each year — without a current APC you cannot legally work in NZ ECE.",
          "upcoming", "Ongoing"),
      ],
    };
  }

  // ── OVERSEAS-TRAINED ────────────────────────────────────
  const complexity: PathwayResult["complexity"] =
    isBachelor || isDiploma3 ? "moderate" : "complex";

  const nzExpNote = hasNZMore
    ? "Your NZ ECE experience is a significant advantage — include detailed evidence of this in your application."
    : hasNZLess
    ? "Your limited NZ experience is helpful but the Council will still want strong evidence of your overseas practice."
    : noExp
    ? "Without NZ ECE experience, the Teaching Council will look closely at how your overseas training maps to Te Whāriki."
    : "";

  const qualWarning = (isCertOnly || isDiploma2)
    ? "Your qualification level may not meet the Teaching Council's minimum standard. You may be granted Provisional Registration only, or asked to complete additional study."
    : undefined;

  const countryWarning = isChina
    ? "Chinese ECE qualifications must go through NZQA assessment first. Allow 6–12 weeks — this is the most common delay point for Chinese applicants."
    : "All overseas qualifications must be assessed by NZQA before the Teaching Council will consider your application. Start this step as early as possible.";

  return {
    complexity,
    summary: `As an overseas-trained ECE professional from ${country}, your path to NZ registration involves multiple agencies and typically takes 3–9 months. ${nzExpNote}`.trim(),
    warning: qualWarning ?? countryWarning,
    steps: [
      step(1, "Get Your Qualification Assessed by NZQA",
        `Submit your academic transcripts, qualification certificates and a certified English translation to NZQA (nzqa.govt.nz) for an International Qualification Assessment. Cost: ~$NZD 570. ${isChina ? "Allow 6–12 weeks for processing." : "Allow 4–8 weeks."}`,
        "active", isChina ? "6–12 weeks" : "4–8 weeks"),
      step(2, "Gather Supporting Documents",
        "While waiting for NZQA, collect: certified copies of all academic transcripts, proof of identity (passport), police clearance certificates from every country you've lived in over the last 5 years, and details of two professional referees who know your ECE practice.",
        "upcoming", "2–4 weeks"),
      step(3, "Apply to the Teaching Council",
        "Once you have your NZQA result, apply at teachingcouncil.nz. You'll need your NZQA assessment outcome, identity documents, referee contact details, and a short personal statement about your ECE philosophy and experience.",
        "upcoming", "4–8 weeks to process"),
      step(4, "Provisional Registration",
        `Most overseas-trained teachers receive Provisional Registration first. This allows you to legally work in NZ ECE${hasNZExp ? " — which you can start doing straight away" : ""}. You'll be assigned a mentor and complete a professional development plan.`,
        "upcoming", "1–2 years"),
      step(5, "Full Registration",
        "After completing provisional requirements (typically 2 years of supported practice with regular reviews), apply to upgrade to Full Registration. This unlocks all senior ECE roles and better pay bands.",
        "upcoming", "Ongoing"),
    ],
  };
}

function step(
  number: number,
  title: string,
  body: string,
  status: PathwayStep["status"],
  estimatedTime?: string
): PathwayStep {
  return { number, title, body, status, estimatedTime };
}
