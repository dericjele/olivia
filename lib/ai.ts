import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model selection
// Haiku  → fast structured JSON tasks (pathway, quiz insight) ~2-4s
// Sonnet → nuanced analysis tasks (CV, workplace guidance)   ~6-10s
const HAIKU  = "claude-haiku-4-5-20251001";
const SONNET = "claude-sonnet-4-6";

const OLIVIA_SYSTEM = `You are Olivia, an ECE lecturer and career consultant in Auckland, NZ. You specialise in helping Chinese-trained ECE professionals navigate New Zealand's early childhood sector. You know Te Whāriki, Learning Stories, NZ Teaching Council registration, values-based interviewing, and NZ employment law. Be warm, specific and practical. Never give generic advice.`;

// ─── HELPERS ─────────────────────────────────────────────

function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

async function ask(
  prompt: string,
  model: string,
  maxTokens = 600
): Promise<string> {
  const msg = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: OLIVIA_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });
  return (msg.content[0] as { type: string; text: string }).text;
}

// ─── CV ANALYSIS ────────────────────────────────────────

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
  const prompt = `Analyse this CV for NZ ECE roles. Score 0-100 based on:
- NZ ECE qualification (20pts)
- Te Whāriki knowledge (15pts)
- Learning Stories experience (15pts)
- NZ ECE language/tone (15pts)
- ECE work experience (20pts)
- NZ CV presentation (15pts)

Return ONLY valid JSON, no markdown:
{"score":N,"headline":"one sentence","keyInsight":"most important thing they need to know","strengths":["s1","s2"],"gaps":["g1","g2","g3"],"quickWins":["w1","w2","w3"]}

CV:
${cvText.substring(0, 3000)}`;

  const raw = await ask(prompt, SONNET, 500);
  const parsed = parseJSON<{
    score: number;
    headline: string;
    keyInsight: string;
    strengths: string[];
    gaps: string[];
    quickWins: string[];
  }>(raw);

  const score = parsed.score ?? 50;
  const band: CVAnalysisResult["band"] =
    score >= 68 ? "high" : score >= 45 ? "mid" : "low";
  const nextStep: CVAnalysisResult["nextStep"] =
    score >= 68 ? "interview_bank" : score >= 45 ? "full_package" : "cv_session";

  const { score: _s, ...rest } = parsed;
  return { score, band, nextStep, ...rest };
}

// ─── QUIZ INSIGHT ────────────────────────────────────────

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
  const weakQuestions = answers
    .map((s, i) => ({ q: i + 1, s }))
    .sort((a, b) => a.s - b.s)
    .slice(0, 3)
    .map((x) => x.q);

  // Questions: 1=Qual, 2=TeWhariki, 3=LearningStories, 4=English,
  //            5=Registration, 6=Interviews, 7=Culture, 8=CV, 9=Parents, 10=Timeline
  const qLabels: Record<number, string> = {
    1: "ECE qualification", 2: "Te Whāriki knowledge",
    3: "Learning Stories",  4: "English confidence",
    5: "Teacher registration", 6: "NZ interview experience",
    7: "NZ workplace culture", 8: "NZ-ready CV",
    9: "Parent communication", 10: "Timeline",
  };
  const weakAreas = weakQuestions.map((q) => qLabels[q] ?? `Q${q}`).join(", ");

  const prompt = `NZ ECE readiness quiz result: ${score}% (weak areas: ${weakAreas}).

Return ONLY valid JSON, no markdown:
{"title":"short honest title","insight":"2 sentences specific to their weak areas","primaryGap":"single biggest gap named specifically","recommendation":"one clear next action"}`;

  const raw = await ask(prompt, HAIKU, 250);
  return parseJSON<QuizInsightResult>(raw);
}

// ─── WORKPLACE GUIDANCE ──────────────────────────────────

export interface WorkplaceGuidanceResult {
  validation: string;
  guidance: string[];
  nzContext: string;
  reminder: string;
}

const situationMap: Record<string, string> = {
  manager:  "a difficult or unsupportive manager",
  voice:    "feeling unheard and invisible in their team",
  job:      "serious anxiety about their job security",
  cultural: "cultural misunderstandings and communication barriers",
  rights:   "concerns about unfair treatment or possible discrimination",
  other:    "a difficult workplace situation",
};

export async function generateWorkplaceGuidance(
  situationId: string
): Promise<WorkplaceGuidanceResult> {
  const situation = situationMap[situationId] ?? situationMap.other;

  const prompt = `A Chinese ECE professional in NZ is experiencing ${situation}. They came here quietly — they are not looking for a helpline or a lecture. They need someone who has seen this before and isn't alarmed by it.

Respond like a trusted colleague talking quietly over coffee. Not a counsellor. Not a legal pamphlet. Just someone who gets it and has seen it before.

Return ONLY valid JSON, no markdown:
{"validation":"2-3 sentences — name the specific situation and normalise it without dismissing it. Never start with 'I understand how you feel'. Sound like someone who has seen this before and is not surprised.","guidance":["practical step 1 — specific, doable, not overwhelming","practical step 2","practical step 3"],"nzContext":"1 quiet sentence pointing to Employment NZ 0800 20 90 20 as a free confidential resource — not framed as legal advice, just as something that exists","reminder":"one quiet closing sentence — not motivational, just human. Something a good colleague would say."}

Max 200 words total. Warm but not effusive. Practical but not cold. Never preachy.`;

  const raw = await ask(prompt, SONNET, 450);
  return parseJSON<WorkplaceGuidanceResult>(raw);
}

// ─── TC PATHWAY ──────────────────────────────────────────

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
  const isOverseas = answers.qual_country !== "New Zealand";
  const isBachelor = answers.qual_level.includes("Bachelor");
  const hasNZExp   = answers.nz_experience.startsWith("Yes");

  const prompt = `NZ Teacher Registration pathway for:
- Qualification from: ${answers.qual_country}
- Level: ${answers.qual_level}
- NZ ECE experience: ${answers.nz_experience}

Return ONLY valid JSON, no markdown:
{"complexity":"straightforward|moderate|complex","summary":"2 sentences about their specific situation","steps":[{"number":1,"title":"step title","body":"what to actually do — specific documents and where to go","status":"done|active|upcoming","estimatedTime":"e.g. 2-4 weeks"}],"warning":"one critical thing that causes delays OR null"}

Generate ${isOverseas ? "5" : "4"} steps. First incomplete step = active, completed = done, rest = upcoming. Be specific to NZ Teaching Council requirements.`;

  const raw = await ask(prompt, HAIKU, 600);
  return parseJSON<PathwayResult>(raw);
}
