export type Lang = "en" | "zh";

export type JourneyType =
  | "quiz"
  | "cv"
  | "pathway"
  | "interview"
  | "workplace"
  | null;

export interface LeadData {
  contact?: string;
  journeyType?: string;
  quizScore?: number;
  cvScore?: number;
  pathwayType?: string;
  workplaceSituation?: string;
  bookingNeed?: string;
  bookingTimeline?: string;
  trafficSource?: string;
  timestamp?: string;
}

export interface QuizQuestion {
  q: string;
  opts: string[];
  scores: number[];
}

export interface InterviewQuestion {
  cat: "values" | "behaviour" | "curriculum" | "culture";
  q: string;
  a: string;
  tip: string;
}

export interface WorkplaceSituation {
  id: string;
  icon: string;
  en: string;
  zh: string;
  subEn: string;
  subZh: string;
}
