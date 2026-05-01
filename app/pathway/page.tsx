"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "@/components/Shell";
import { useLang } from "@/components/LangProvider";
import { Gate } from "@/components/Gate";
import {
  BackBtn, Btn, SectionLabel, ScreenTitle, ScreenSub,
  Card, DarkCard, Spinner, InsightBar, QuizOption, ProgressBar, PillTag,
} from "@/components/ui";
import { saveLead } from "@/lib/storage";
import { PATHWAY_QUESTIONS } from "@/lib/data";
import type { PathwayResult } from "@/lib/ai";

type Stage = "questions" | "gate" | "loading" | "result";

export default function PathwayPage() {
  const router = useRouter();
  const { t } = useLang();

  const [stage, setStage] = useState<Stage>("questions");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PathwayResult | null>(null);

  const q = PATHWAY_QUESTIONS[step];
  const isLast = step === PATHWAY_QUESTIONS.length - 1;

  const next = () => {
    if (selected === null) return;
    const newAnswers = { ...answers, [q.id]: q.opts[selected].en };
    setAnswers(newAnswers);
    setSelected(null);
    if (isLast) {
      setStage("gate");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStep(step + 1);
    }
  };

  const fetchPathway = async () => {
    setStage("loading");
    try {
      const res = await fetch("/api/pathway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (res.ok && data.steps) {
        setResult(data);
        saveLead({ pathwayType: answers.qual_country === "New Zealand" ? "nz" : "overseas" });
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    }
    setStage("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const complexityColor = {
    straightforward: "sage" as const,
    moderate: "yellow" as const,
    complex: "light" as const,
  };

  return (
    <Shell>
      <FunnelPage>
        <BackBtn onClick={() => router.push("/journey")} label={t("Back", "返回")} />
        <SectionLabel>{t("Registration Path", "注册路径")}</SectionLabel>
        <ScreenTitle>{t("YOUR NZ TEACHER\nREGISTRATION\nPATH.", "你的新西兰\n教师注册路径")}</ScreenTitle>
        <ScreenSub>{t("3 questions. We'll map your exact steps.", "3个问题，为你规划具体步骤。")}</ScreenSub>

        {stage === "questions" && (
          <div className="animate-fadeUp">
            <ProgressBar current={step + 1} total={PATHWAY_QUESTIONS.length} />
            <p className="font-display text-[26px] tracking-wide text-ink leading-snug mb-5">
              {t(q.en, q.zh)}
            </p>
            <div className="flex flex-col gap-[10px] mb-6">
              {q.opts.map((opt, i) => (
                <QuizOption key={i} selected={selected === i} onClick={() => setSelected(i)}>
                  {t(opt.en, opt.zh)}
                </QuizOption>
              ))}
            </div>
            <Btn onClick={next} disabled={selected === null}>
              {isLast ? t("Show My Pathway →", "显示我的路径 →") : t("Next →", "下一步 →")}
            </Btn>
          </div>
        )}

        {stage === "gate" && (
          <div className="animate-fadeUp">
            <Gate
              icon="🗺️"
              titleEn="Your pathway is mapped!"
              titleZh="你的路径已规划好！"
              subEn="Enter your contact so Olivia can send you this personalised pathway guide."
              subZh="输入联系方式，Olivia将为你发送个性化路径指南。"
              funnelType="pathway"
              onContinue={fetchPathway}
            />
          </div>
        )}

        {stage === "loading" && (
          <Card className="flex flex-col items-center py-10 gap-4">
            <Spinner />
            <p className="text-[14px] text-mid">{t("Mapping your pathway...", "正在规划你的路径...")}</p>
          </Card>
        )}

        {stage === "result" && result && (
          <div className="animate-fadeUp flex flex-col gap-4">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <PillTag color={complexityColor[result.complexity]}>
                  {result.complexity}
                </PillTag>
              </div>
              <InsightBar>{result.summary}</InsightBar>
              {result.warning && (
                <div className="bg-red-50 border-l-4 border-danger rounded-r-app px-4 py-3 text-[13px] text-danger mb-4">
                  <strong>⚠️ Watch out: </strong>{result.warning}
                </div>
              )}
            </Card>

            <div className="flex flex-col gap-0">
              {result.steps.map((s, i) => (
                <div key={i} className="flex gap-4 pb-6 relative">
                  {i < result.steps.length - 1 && (
                    <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${s.status === "done" ? "bg-[#F5A800]" : "bg-light"}`} />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-[16px] flex-shrink-0 border-2 z-10 ${
                    s.status === "done"   ? "bg-[#F5A800] border-[#F5A800] text-ink" :
                    s.status === "active" ? "border-[#F5A800] text-[#F5A800] bg-card" :
                    "border-light text-mid bg-card"
                  }`}>
                    {s.status === "done" ? "✓" : s.number}
                  </div>
                  <div className="flex-1 pt-2">
                    <strong className="block text-[14px] font-semibold text-ink mb-1">{s.title}</strong>
                    <p className="text-[12px] text-mid leading-relaxed mb-2">{s.body}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${
                        s.status === "done" ? "bg-sage-pale text-sage" :
                        s.status === "active" ? "bg-[#FFF8E1] text-[#C98500]" :
                        "bg-light text-mid"
                      }`}>
                        {s.status === "done" ? "✓ Done" : s.status === "active" ? "Start here" : "Upcoming"}
                      </span>
                      {s.estimatedTime && (
                        <span className="text-[10px] text-mid">{s.estimatedTime}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DarkCard>
              <p className="text-[14px] text-white/80 leading-relaxed mb-4">
                {t(
                  "This process has hidden complexity that trips most people up. Olivia has guided dozens through it — saving months of delays.",
                  "这个流程有隐藏的复杂性，很多人都会在这里遇到障碍。Olivia已经帮助数十人完成注册，节省了数月的等待时间。"
                )}
              </p>
              <Btn onClick={() => router.push("/book")} className="mb-2">
                {t("Book a Registration Session — $149", "预约注册咨询 — $149")}
              </Btn>
              <Btn variant="outline" onClick={() => router.push("/cv")}
                className="border-white/20 text-white/70">
                {t("Check my CV first →", "先检查我的简历 →")}
              </Btn>
            </DarkCard>
          </div>
        )}

        {stage === "result" && !result && (
          <Card>
            <p className="text-[14px] text-danger">{t("Something went wrong. Please try again.", "出现错误，请重试。")}</p>
            <Btn onClick={() => { setStage("questions"); setStep(0); setAnswers({}); }} className="mt-4">
              {t("Try Again", "重试")}
            </Btn>
          </Card>
        )}
      </FunnelPage>
    </Shell>
  );
}
