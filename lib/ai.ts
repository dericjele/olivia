import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─────────────────────────────────────────
// SYSTEM PROMPT — shared Olivia persona
// ─────────────────────────────────────────
const OLIVIA_SYSTEM = `You are Olivia, an experienced Early Childhood Education (ECE) lecturer and career consultant based in Auckland, New Zealand. You have deep expertise in:

- New Zealand's ECE curriculum framework Te Whāriki and its five strands (Belonging, Wellbeing, Exploration, Communication, Contribution)
- NZ Teaching Council registration pathways for both NZ-trained and overseas-trained teachers
- Learning Stories as assessment tools — how to write them, what makes them effective in NZ ECE
- NZ ECE hiring practices, what centre managers look for, values-based interviewing
- The cultural context of Chinese ECE professionals navigating the NZ system
- NZ Employment Relations Act and workplace rights
- The difference between NZ child-led play philosophy vs structured curriculum approaches

You communicate with warmth, honesty and specificity. You never give generic advice — you always connect your guidance to NZ ECE realities. You are bilingual (English and Mandarin) but respond in the language of the input unless told otherwise.`;

// ─────────────────────────────────────────
// CV ANALYSIS — ECE-optimised
// ─────────────────────────────────────────
export interface CVAnalysisResult {
  score: number;
  band: "low" | "mid" | "high";
  headline: string;
  keyInsight: string;
  strengths: string[];
  gaps: string[];
  quickWins: string[];
  nextStep: "cv_session" | "full_package" | "interview_bank";
}

export async function analyseCV(cvText: string): Promise<CVAnalysisResult> {
  const prompt = `Analyse the following CV for someone applying to NZ Early Childhood Education (ECE) roles.

SCORING CRITERIA — score out of 100 based on:
1. NZ ECE qualification recognition (is it TC-registrable?) — 20 points
2. Te Whāriki / NZ curriculum knowledge evident — 15 points  
3. Learning Stories experience mentioned — 15 points
4. Language and tone appropriate for NZ ECE (child-led, reflective, strengths-based) — 15 points
5. Relevant ECE work experience (NZ preferred, overseas accepted) — 20 points
6. Professional presentation for NZ job market (layout, length, referees) — 15 points

Return ONLY valid JSON in this exact structure (no markdown, no explanation outside JSON):
{
  "score": <number 0-100>,
  "headline": "<one sentence summary of their ECE career readiness>",
  "keyInsight": "<the single most important thing this person needs to know — be specific and honest>",
  "strengths": ["<strength 1 — specific to NZ ECE>", "<strength 2>", "<strength 3 if applicable>"],
  "gaps": ["<gap 1 — specific NZ ECE gap>", "<gap 2>", "<gap 3 if applicable>", "<gap 4 if applicable>"],
  "quickWins": ["<actionable fix 1 they can do this week>", "<actionable fix 2>", "<actionable fix 3>"]
}

CV TO ANALYSE:
${cvText.substring(0, 4000)}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 800,
    system: OLIVIA_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;

  // Strip any markdown fences if present
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const score: number = parsed.score ?? 50;
  const band: "low" | "mid" | "high" =
    score >= 68 ? "high" : score >= 45 ? "mid" : "low";

  // Score-responsive next step routing
  const nextStep: CVAnalysisResult["nextStep"] =
    score >= 68
      ? "interview_bank"   // CV is solid — move to interview prep
      : score >= 45
      ? "full_package"     // Needs both CV + interview help
      : "cv_session";      // CV needs work first

  return {
    score,
    band,
    headline: parsed.headline ?? "",
    keyInsight: parsed.keyInsight ?? "",
    strengths: parsed.strengths ?? [],
    gaps: parsed.gaps ?? [],
    quickWins: parsed.quickWins ?? [],
    nextStep,
  };
}

// ─────────────────────────────────────────
// QUIZ RESULT INSIGHT
// ─────────────────────────────────────────
export interface QuizInsightResult {
  title: string;
  insight: string;
  primaryGap: string;
  recommendation: string;
}

export async function generateQuizInsight(
  score: number,
  answers: number[]
): Promise<QuizInsightResult> {
  const band = score >= 75 ? "high" : score >= 45 ? "mid" : "low";

  const prompt = `A Chinese ECE professional in NZ has completed a readiness quiz and scored ${score}% (${band} readiness band).

Their answer pattern: ${answers.join(", ")} (scores per question, max 10 each)
Lowest scoring areas are questions: ${answers
    .map((s, i) => ({ i: i + 1, s }))
    .sort((a, b) => a.s - b.s)
    .slice(0, 3)
    .map((x) => x.i)
    .join(", ")}

The quiz questions cover: (1) Qualification, (2) Te Whāriki knowledge, (3) Learning Stories, (4) English confidence, (5) Teacher Registration, (6) Interview experience, (7) NZ workplace culture, (8) CV readiness, (9) Parent communication, (10) Timeline

Return ONLY valid JSON:
{
  "title": "<short punchy title for their result — honest, not generic>",
  "insight": "<2-3 sentences specific to their score pattern — what this means for their NZ ECE job search>",
  "primaryGap": "<the single biggest gap holding them back, named specifically>",
  "recommendation": "<one clear recommended next action>"}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 400,
    system: OLIVIA_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// ─────────────────────────────────────────
// WORKPLACE SUPPORT GUIDANCE
// ─────────────────────────────────────────
export interface WorkplaceGuidanceResult {
  validation: string;
  guidance: string[];
  nzContext: string;
  reminder: string;
}

const situationDescriptions: Record<string, string> = {
  manager:  "difficulty with a difficult or unsupportive manager in their ECE centre",
  voice:    "feeling unheard and invisible within their ECE team",
  job:      "anxiety and serious worry about their job security in their ECE role",
  cultural: "cultural misunderstandings and communication barriers in their NZ ECE workplace",
  rights:   "concerns about being treated unfairly or experiencing possible discrimination at their ECE centre",
  other:    "a difficult and distressing workplace situation in their NZ ECE role",
};

export async function generateWorkplaceGuidance(
  situationId: string
): Promise<WorkplaceGuidanceResult> {
  const situation =
    situationDescriptions[situationId] || situationDescriptions.other;

  const prompt = `A Chinese ECE professional working in New Zealand is experiencing ${situation}. They have come here because they have nobody else to turn to for advice.

Write warm, empathetic, practically helpful guidance. Return ONLY valid JSON:
{
  "validation": "<2-3 sentences: acknowledge their experience specifically, normalise it without dismissing it, make them feel genuinely heard and safe>",
  "guidance": [
    "<practical step 1 — specific to NZ ECE workplace context>",
    "<practical step 2>",
    "<practical step 3>"
  ],
  "nzContext": "<1-2 sentences about relevant NZ employment rights, e.g. Employment Relations Act, right to raise a personal grievance, Employment NZ helpline 0800 20 90 20 — DO NOT give legal advice, DO point to resources>",
  "reminder": "<1 warm, human closing sentence — remind them this situation does not define their career or their worth>"
}

Tone: warm first, practical second. This person is anxious and needs to feel safe before they can hear advice. Max 280 words total across all fields.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 600,
    system: OLIVIA_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// ─────────────────────────────────────────
// TC PATHWAY GENERATOR
// ─────────────────────────────────────────
export interface PathwayStep {
  number: number;
  title: string;
  body: string;
  status: "done" | "active" | "upcoming";
  estimatedTime?: string;
}

export interface PathwayResult {
  complexity: "straightforward" | "moderate" | "complex";
  summary: string;
  steps: PathwayStep[];
  warning?: string;
}

export async function generatePathway(answers: {
  qual_country: string;
  qual_level: string;
  nz_experience: string;
}): Promise<PathwayResult> {
  const prompt = `A person wants to know their NZ Teacher Registration pathway. Their situation:
- Qualification country: ${answers.qual_country}
- Qualification level: ${answers.qual_level}  
- NZ ECE experience: ${answers.nz_experience}

Based on NZ Teaching Council requirements, generate their specific registration pathway.

Return ONLY valid JSON:
{
  "complexity": "<'straightforward' | 'moderate' | 'complex'>",
  "summary": "<2 sentences explaining their specific situation and why their pathway is that complexity>",
  "steps": [
    {
      "number": 1,
      "title": "<step title>",
      "body": "<specific practical description — what they actually need to do, what documents, where to go>",
      "status": "<'done' | 'active' | 'upcoming'>",
      "estimatedTime": "<realistic time estimate e.g. '2-4 weeks' or 'ongoing'>"
    }
  ],
  "warning": "<optional: one critical thing that commonly causes delays for people in their situation — null if none>"
}

Generate 4-6 steps appropriate to their specific situation. Mark the first incomplete step as 'active', any already-done steps as 'done', rest as 'upcoming'.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    system: OLIVIA_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}
