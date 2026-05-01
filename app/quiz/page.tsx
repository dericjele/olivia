"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "../../components/Shell";
import { useLang } from "../../components/LangProvider";
import { Gate } from "../../components/Gate";
import {
  BackBtn, Btn, SectionLabel, ScreenTitle, ScreenSub,
  ScoreCircle, InsightBar, Card, DarkCard, Spinner,
  ProgressBar, QuizOption,
} from "../../components/ui";
import { saveLead } from "../../lib/storage";
import { QUIZ_QUESTIONS } from "../../lib/data";
import type { QuizInsightResult } from "../../lib/ai";

type Stage = "quiz" | "gate" | "loading" | "result";

export default function QuizPage() {
  const router = useRouter();
  const { t } = useLang();

  const [stage, setStage] = useState<Stage>("quiz");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizInsightResult | null>(null);
  const [score, setScore] = useState(0);

  const q = QUIZ_QUESTIONS[current];
  const isLast = current === QUIZ_QUESTIONS.length - 1;

  const selectOption = (idx: number) => setSelected(idx);

  const next = () => {
    if (selected === null) return;
    const newAnswers = [...answers, q.scores[selected]];
    setAnswers(newAnswers);
    setSelected(null);

    if (isLast) {
      const total = newAnswers.reduce((a, b) => a + b, 0);
      const max = QUIZ_QUESTIONS.reduce((a, q) => a + Math.max(...q.scores), 0);
      const pct = Math.round((total / max) * 100);
      setScore(pct);
      saveLead({ quizScore: pct });
      setStage("gate");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrent(current + 1);
    }
  };

  const fetchResult = async () => {
    setStage("loading");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, answers }),
      });
      const data = await res.json();
      setResult(data);
      setStage("result");
    } catch {
      // Fallback static result
      setResult({
        title: score >= 75 ? "You're Nearly Job-Ready" : score >= 45 ? "Good Progress — Gaps to Close" : "Great Time to Start",
        insight: "Based on your answers, there are specific NZ ECE areas where targeted guidance will make a real difference.",
        primaryGap: "NZ-specific knowledge and preparation",
        recommendation: "Book a free discovery call with Olivia to map out your exact next steps.",
      });
      setStage("result");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const band: "low" | "mid" | "high" = score >= 75 ? "high" : score >= 45 ? "mid" : "low";

  return (
    <Shell>
      <FunnelPage>
        <BackBtn onClick={() => router.push("/journey")} label={t("Back", "返回")} />

        <SectionLabel>{t("Readiness Quiz", "准备度测试")}</SectionLabel>
        <ScreenTitle>{t("HOW READY\nARE YOU?", "你准备好了吗？")}</ScreenTitle>
        <ScreenSub>
          {t(
            "10 questions. Honest answers give you the clearest picture.",
            "10个问题。诚实回答，获得最清晰的现状分析。"
          )}
        </ScreenSub>

        {/* ── QUIZ ── */}
        {stage === "quiz" && (
          <div className="animate-fadeUp">
            <ProgressBar current={current + 1} total={QUIZ_QUESTIONS.length} />

            <p className="font-display text-[26px] tracking-wide text-ink leading-snug mb-5">
              {q.q}
            </p>

            <div className="flex flex-col gap-[10px] mb-6">
              {q.opts.map((opt, i) => (
                <QuizOption key={i} selected={selected === i} onClick={() => selectOption(i)}>
                  {opt}
                </QuizOption>
              ))}
            </div>

            <Btn onClick={next} disabled={selected === null}>
              {isLast
                ? t("See My Results →", "查看结果 →")
                : t("Next Question →", "下一题 →")}
            </Btn>
          </div>
        )}

        {/* ── GATE ── */}
        {stage === "gate" && (
          <div className="animate-fadeUp">
            <Gate
              icon="🎯"
              titleEn="Your score is ready!"
              titleZh="你的分数已准备好！"
              subEn="Enter your WeChat ID or email to see your personalised readiness report."
              subZh="输入微信号或邮箱，查看你的个性化准备度报告。"
              funnelType="quiz"
              onContinue={fetchResult}
            />
          </div>
        )}

        {/* ── LOADING ── */}
        {stage === "loading" && (
          <Card className="flex flex-col items-center py-10 gap-4">
            <Spinner />
            <p className="text-[14px] text-mid">{t("Generating your report...", "正在生成报告...")}</p>
          </Card>
        )}

        {/* ── RESULT ── */}
        {stage === "result" && result && (
          <div className="animate-fadeUp flex flex-col gap-4">
            <Card>
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-light">
                <ScoreCircle score={score} band={band} />
                <div>
                  <p className="text-[15px] font-semibold text-ink mb-1">{result.title}</p>
                  <p className="text-[12px] text-mid">
                    {t("NZ ECE Readiness Score", "新西兰幼教准备度评分")}
                  </p>
                </div>
              </div>

              <InsightBar>
                <strong className="text-[#C98500]">{t("Your situation: ", "你的现状：")}</strong>
                {result.insight}
              </InsightBar>

              <div className="bg-light rounded-[10px] p-3 mb-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-mid mb-1">
                  {t("Primary gap", "主要差距")}
                </p>
                <p className="text-[13px] text-ink">{result.primaryGap}</p>
              </div>
            </Card>

            <DarkCard>
              <p className="text-[14px] text-white/80 leading-relaxed mb-4">
                {result.recommendation}
              </p>

              {band === "high" ? (
                <>
                  <Btn onClick={() => router.push("/interview")} className="mb-2">
                    {t("Practice Interview Questions →", "练习面试题 →")}
                  </Btn>
                  <Btn variant="outline" onClick={() => router.push("/book")}
                    className="border-white/20 text-white/70">
                    {t("Or book a session with Olivia", "或预约Olivia的咨询")}
                  </Btn>
                </>
              ) : (
                <>
                  <Btn onClick={() => router.push("/book")} className="mb-2">
                    {t("Book a Free Discovery Call", "预约免费探索通话")}
                  </Btn>
                  <Btn variant="outline" onClick={() => router.push("/cv")}
                    className="border-white/20 text-white/70">
                    {t("Check my CV first →", "先检查我的简历 →")}
                  </Btn>
                </>
              )}
            </DarkCard>

            <button
              onClick={() => { setStage("quiz"); setCurrent(0); setAnswers([]); setSelected(null); setResult(null); }}
              className="text-[12px] text-mid underline text-center font-body"
            >
              {t("Retake the quiz", "重新测试")}
            </button>
          </div>
        )}
      </FunnelPage>
    </Shell>
  );
}
