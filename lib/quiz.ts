import type { QuizInsightResult } from "./ai";

const Q_LABELS = [
  "ECE qualification",
  "Te Whāriki knowledge",
  "Learning Stories experience",
  "English confidence",
  "Teacher Registration progress",
  "NZ interview experience",
  "NZ workplace culture familiarity",
  "NZ-ready CV",
  "Parent communication",
  "Job search timeline",
];

const MAX_SCORES = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

/**
 * Build a quiz insight from scores — no AI, instant.
 */
export function buildQuizInsight(
  score: number,
  answers: number[]
): QuizInsightResult {
  // Find the 2 weakest areas
  const ranked = answers
    .map((s, i) => ({ label: Q_LABELS[i] ?? `Area ${i + 1}`, score: s, max: MAX_SCORES[i] ?? 10 }))
    .sort((a, b) => a.score / a.max - b.score / b.max);

  const weakest  = ranked[0];
  const second   = ranked[1];

  // Band-based titles and insights
  if (score >= 75) {
    return {
      title: "You're Nearly Job-Ready",
      insight: `Strong foundations across the board. Your biggest remaining gap is ${weakest.label.toLowerCase()} — addressing this specifically will sharpen your applications significantly.`,
      primaryGap: weakest.label,
      recommendation:
        "Practice real NZ ECE interview questions and get your CV reviewed by Olivia to close the final gaps before you apply.",
    };
  }

  if (score >= 55) {
    return {
      title: "Good Progress — Key Gaps to Close",
      insight: `You have solid experience but two areas are holding you back: ${weakest.label.toLowerCase()} and ${second?.label.toLowerCase() ?? "NZ-specific preparation"}. These are entirely fixable with targeted guidance.`,
      primaryGap: `${weakest.label} and ${second?.label ?? "NZ preparation"}`,
      recommendation:
        "A single focused session with Olivia will identify exactly what to fix — most people in your position land roles within 6–8 weeks of getting the right guidance.",
    };
  }

  if (score >= 35) {
    return {
      title: "Early Stage — Guidance Will Save You Months",
      insight: `Your main gaps are ${weakest.label.toLowerCase()} and ${second?.label.toLowerCase() ?? "NZ ECE preparation"}. Without addressing these, applications are likely to be screened out before interview. The good news — these are fixable.`,
      primaryGap: weakest.label,
      recommendation:
        "Book a free discovery call with Olivia before you apply further. Getting clarity on your specific gaps now will save months of trial and error.",
    };
  }

  return {
    title: "Start With the Right Foundation",
    insight: `You're earlier in the journey — which is actually the best time to get guidance. Your biggest gap right now is ${weakest.label.toLowerCase()}. Starting with the right foundations means you won't waste time applying for roles you're not ready for.`,
    primaryGap: weakest.label,
    recommendation:
      "Book a free discovery call with Olivia. She'll map out a realistic plan for your specific situation so you know exactly what to focus on first.",
  };
}
