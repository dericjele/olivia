import type { PathwayResult, PathwayStep } from "./ai";

interface PathwayAnswers {
  qual_country:  string;
  qual_level:    string;
  nz_experience: string;
}

/**
 * Build a TC registration pathway from 3 answers.
 * Pure logic — no AI, no network calls, instant.
 * All NZ Teaching Council guidance is hardcoded from official requirements.
 */
export function buildPathway(answers: PathwayAnswers): PathwayResult {
  const isNZ       = answers.qual_country === "New Zealand";
  const isBachelor = answers.qual_level.includes("Bachelor");
  const isDiploma3 = answers.qual_level.includes("3 years");
  const isDiploma2 = answers.qual_level.includes("2 years");
  const isCertOnly = answers.qual_level.includes("Certificate");
  const hasNZMore  = answers.nz_experience.includes("more than 6");
  const hasNZLess  = answers.nz_experience.includes("less than 6");
  const hasNZExp   = hasNZMore || hasNZLess;
  const noExp      = answers.nz_experience.includes("No ECE");

  // ── NZ-TRAINED ───────────────────────────────────────────
  if (isNZ) {
    if (isCertOnly) {
      return {
        complexity: "moderate",
        summary:
          "Your NZ certificate-level qualification does not meet the minimum Teaching Council requirement of a 3-year diploma. You will need to complete further study before applying for registration.",
        warning:
          "A certificate alone is not enough for Teacher Registration. You must complete at least a 3-year ECE diploma or equivalent.",
        steps: [
          step(1, "Confirm Your Qualification Gap",
            "Contact your provider or the Teaching Council (teachingcouncil.nz) to confirm exactly how many more credits or years of study you need to meet the Level 6 diploma requirement.",
            "active", "1–2 weeks"),
          step(2, "Enrol in a Top-Up Programme",
            "Several NZ polytechnics (e.g. Unitec, AUT, Open Polytechnic) offer part-time top-up programmes for working ECE teachers. Many can be completed while you work.",
            "upcoming", "6–18 months"),
          step(3, "Apply to the Teaching Council",
            "Once qualified, submit your application at teachingcouncil.nz with your qualification documents, identity verification, and two referee details.",
            "upcoming", "4–8 weeks"),
          step(4, "Receive Registration + Get Your APC",
            "Most NZ-trained graduates receive Full Registration. You must then renew your Annual Practising Certificate (APC) every year to legally work in ECE.",
            "upcoming", "Ongoing"),
        ],
      };
    }

    return {
      complexity: "straightforward",
      summary:
        `Your NZ ${isBachelor ? "degree" : "diploma"} meets Teaching Council requirements. Your path to registration is relatively direct — the main steps are application, verification and receiving your practising certificate.`,
      warning: hasNZMore
        ? undefined
        : "Make sure your qualification is from a New Zealand-registered provider and meets the Teaching Council's approved qualifications list.",
      steps: [
        step(1, "Check the Approved Qualifications List",
          "Confirm your specific qualification is on the Teaching Council's approved list at teachingcouncil.nz/qualifications. This takes 5 minutes and avoids surprises.",
          "active", "Same day"),
        step(2, "Create a Teaching Council Account",
          "Register at teachingcouncil.nz. You'll need a valid NZ address, identity documents (passport or birth certificate + proof of address), and your academic transcripts.",
          "upcoming", "1–2 days"),
        step(3, "Submit Your Registration Application",
          "Complete the online application. You'll need two referees who can speak to your professional practice — ideally a placement supervisor or ECE centre director.",
          "upcoming", "2–4 weeks to process"),
        step(4, "Receive Registration and Annual Practising Certificate",
          "Once approved you receive Full Registration and your first Annual Practising Certificate (APC). You must renew the APC each year. Without a current APC you cannot legally work in NZ ECE.",
          "upcoming", "Ongoing"),
      ],
    };
  }

  // ── OVERSEAS-TRAINED ─────────────────────────────────────

  const complexity: PathwayResult["complexity"] =
    isBachelor || isDiploma3 ? "moderate" : "complex";

  const nzExpNote = hasNZMore
    ? "Your NZ ECE experience is a significant advantage — include detailed evidence of this in your application."
    : hasNZLess
    ? "Your NZ experience helps but you may still need additional evidence of competency."
    : noExp
    ? "Without NZ ECE experience, the Teaching Council will look closely at how your overseas training maps to Te Whāriki."
    : "";

  const qualNote = isCertOnly || isDiploma2
    ? "Your qualification level may not meet the Teaching Council's minimum standard. You may need additional study or be granted provisional status only."
    : "";

  const warning =
    qualNote ||
    (answers.qual_country === "China"
      ? "Chinese ECE qualifications often require NZQA assessment first. Expect 6–12 weeks for NZQA to assess your documents — this is the most common delay point."
      : "Overseas qualifications must be assessed by NZQA before the Teaching Council will consider your application. Start this step as early as possible.");

  return {
    complexity,
    summary: `As an overseas-trained ECE professional from ${answers.qual_country}, your path to NZ registration involves multiple agencies and typically takes 3–9 months. ${nzExpNote}`,
    warning,
    steps: [
      step(1, "Get Your Qualification Assessed by NZQA",
        `Submit your academic transcripts, qualification certificates, and a certified English translation to NZQA (nzqa.govt.nz) for an International Qualification Assessment. Cost: ~$NZD 570. ${answers.qual_country === "China" ? "Allow 6–12 weeks." : "Allow 4–8 weeks."}`,
        "active", answers.qual_country === "China" ? "6–12 weeks" : "4–8 weeks"),
      step(2, "Gather Supporting Documents",
        "While waiting for NZQA, collect: certified copies of all academic transcripts, proof of identity (passport), police clearance certificate from every country you've lived in (last 5 years), and two professional referees who know your ECE practice.",
        "upcoming", "2–4 weeks"),
      step(3, "Apply to the Teaching Council",
        "Once you have your NZQA result, apply at teachingcouncil.nz. You'll need your NZQA assessment, identity documents, referee details, and a personal statement about your ECE philosophy and experience.",
        "upcoming", "4–8 weeks to process"),
      step(4, "Provisional Registration",
        `Most overseas-trained teachers receive Provisional Registration first. This allows you to work in NZ ECE${hasNZExp ? " — which you can already start doing" : ""}. You'll be assigned a mentor and a professional development plan.`,
        "upcoming", "1–2 years"),
      step(5, "Full Registration",
        "After completing your provisional requirements (usually 2 years of supported practice with regular reviews), apply to upgrade to Full Registration. This unlocks all ECE roles and higher pay bands.",
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
