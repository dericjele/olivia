"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "@/components/Shell";
import { useLang } from "@/components/LangProvider";
import { Gate } from "@/components/Gate";
import {
  BackBtn, Btn, SectionLabel, ScreenTitle, ScreenSub,
  ScoreCircle, InsightBar, Card, DarkCard, Spinner,
} from "@/components/ui";
import { saveLead, getLead } from "@/lib/storage";
import type { CVAnalysisResult } from "@/lib/ai";

type Stage = "upload" | "gate" | "analysing" | "result";

export default function CVPage() {
  const router  = useRouter();
  const { t, lang } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  const [stage,    setStage]   = useState<Stage>("upload");
  const [file,     setFile]    = useState<File | null>(null);
  const [text,     setText]    = useState("");
  const [dragging, setDragging]= useState(false);
  const [error,    setError]   = useState("");
  const [result,   setResult]  = useState<CVAnalysisResult | null>(null);
  const [contact,  setContact] = useState<string | undefined>();

  const handleFile = (f: File) => { setFile(f); setError(""); if (f.name.endsWith(".txt")) f.text().then(setText); };
  const canProceed = file !== null || text.trim().length > 40;

  const handleAnalyseClick = () => {
    if (!canProceed) { setError(t("Please upload a file or paste your CV text.", "请上传文件或粘贴简历内容。")); return; }
    setStage("gate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onGateContinue = (capturedContact?: string) => {
    setContact(capturedContact);
    if (capturedContact) saveLead({ contact: capturedContact, journeyType: "cv" });
    runAnalysis(capturedContact);
  };

  const runAnalysis = async (capturedContact?: string) => {
    setStage("analysing");
    setError("");
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (text.trim()) formData.append("text", text.trim());

      const res  = await fetch("/api/cv", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) { setError(data.error || t("Analysis failed.", "分析失败。")); setStage("upload"); return; }

      const cvResult = data as CVAnalysisResult;
      setResult(cvResult);

      if (capturedContact) {
        const source = getLead().trafficSource ?? undefined;
        fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact: capturedContact, journey: "cv", score: cvResult.score, lang, source,
            notes: {
              cv_score: cvResult.score, cv_band: cvResult.band,
              cv_headline: cvResult.headline, cv_key_insight: cvResult.keyInsight,
              cv_gaps: cvResult.gaps?.join(" | "),
              cv_strengths: cvResult.strengths?.join(" | "),
              cv_quick_wins: cvResult.quickWins?.join(" | "),
              cv_next_step: cvResult.nextStep,
              file_type: file?.name.split(".").pop() ?? "text",
            },
          }),
        }).catch(() => {});
      }

      saveLead({ cvScore: cvResult.score });
      setStage("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t("Something went wrong. Please try again.", "出现错误，请重试。"));
      setStage("upload");
    }
  };

  return (
    <Shell>
      <FunnelPage>
        <BackBtn onClick={() => router.push("/journey")} label={t("Back", "返回")} />
        <SectionLabel>{t("CV Analyser", "简历分析")}</SectionLabel>
        <ScreenTitle>{t("YOU'VE DONE\nEVERYTHING RIGHT.", "你已经做了\n该做的一切。")}</ScreenTitle>
        <ScreenSub>
          {t(
            "Your CV just isn't showing that yet. Let's fix it.",
            "你的简历还没有体现出这一点。让我们来改变这个。"
          )}
        </ScreenSub>

        {/* ── UPLOAD ── */}
        {stage === "upload" && (
          <div className="animate-fadeUp flex flex-col gap-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-app p-8 text-center cursor-pointer transition-all ${
                dragging || file ? "border-[#F5A800] bg-[#FFF8E1]" : "border-light bg-card"
              }`}
            >
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-semibold text-ink truncate">{file.name}</p>
                    <p className="text-[12px] text-mid">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setText(""); }}
                    className="text-mid text-lg p-1">✕</button>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">📎</div>
                  <p className="text-[15px] font-semibold text-ink mb-1">{t("Upload your CV", "上传你的简历")}</p>
                  <p className="text-[12px] text-mid mb-3">{t("Tap to browse or drag & drop", "点击浏览或拖放文件")}</p>
                  <div className="flex justify-center gap-2">
                    {["PDF", "DOCX", "TXT"].map(ext => (
                      <span key={ext} className="text-[10px] font-semibold bg-light text-mid px-[10px] py-1 rounded-lg">{ext}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-mid">
              <div className="flex-1 h-px bg-light" />
              <span>{t("or paste text below", "或在下方粘贴文字")}</span>
              <div className="flex-1 h-px bg-light" />
            </div>

            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder={t("Paste your CV text here...", "在此粘贴简历内容...")}
              className="w-full h-[120px] border-2 border-light rounded-[10px] px-4 py-3 text-[13px] font-body text-ink bg-card resize-none outline-none focus:border-[#F5A800] transition-colors placeholder:text-[#BDBDBD] leading-relaxed" />

            {error && <p className="text-[13px] text-danger text-center">{error}</p>}
            <Btn onClick={handleAnalyseClick} disabled={!canProceed}>
              {t("Show Me What to Fix →", "告诉我需要改进什么 →")}
            </Btn>
          </div>
        )}

        {/* ── GATE ── */}
        {stage === "gate" && (
          <div className="animate-fadeUp">
            <Gate
              icon="📊"
              titleEn="Almost there."
              titleZh="即将完成。"
              subEn="Where should we send your report? Olivia personally looks at every one."
              subZh="我们应该把报告发送到哪里？Olivia亲自查看每一份。"
              funnelType="cv"
              onContinue={onGateContinue}
            />
          </div>
        )}

        {/* ── ANALYSING ── */}
        {stage === "analysing" && (
          <Card className="flex flex-col items-center py-10 gap-4">
            <Spinner />
            <p className="text-[14px] text-mid">{t("Reading your CV against NZ ECE standards...", "正在对照新西兰幼教标准分析你的简历...")}</p>
            <p className="text-[12px] text-mid/60">{t("About 15 seconds", "大约需要15秒")}</p>
          </Card>
        )}

        {/* ── RESULT ── */}
        {stage === "result" && result && (
          <div className="animate-fadeUp flex flex-col gap-4">
            <Card>
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-light">
                <ScoreCircle score={result.score} band={result.band} />
                <div>
                  <p className="text-[15px] font-semibold text-ink mb-1">{result.headline}</p>
                  <p className="text-[12px] text-mid">{t("Against NZ ECE hiring standards", "对照新西兰幼教招聘标准")}</p>
                </div>
              </div>

              <InsightBar>
                <strong className="text-[#C98500]">{t("What this means: ", "这意味着：")}</strong>
                {result.keyInsight}
              </InsightBar>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-mid mb-2">
                    {t("What's working", "做得好的地方")}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-ink">
                        <span className="text-sage mt-[2px] flex-shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps — first one free, rest blurred with sticky overlay */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-mid mb-2">
                  {t("What's holding it back", "阻碍它的因素")}
                </p>
                <ul className="flex flex-col gap-2">
                  {result.gaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px]">
                      <span className="text-danger mt-[2px] flex-shrink-0">→</span>
                      {i === 0 ? (
                        <span className="text-ink">{g}</span>
                      ) : (
                        // Sticky blur — uses CSS filter, stays blurred on scroll
                        <span
                          className="text-ink select-none"
                          style={{
                            filter: "blur(4px)",
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            pointerEvents: "none",
                          }}
                          aria-hidden="true"
                        >
                          {g}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {result.gaps.length > 1 && (
                  <div className="mt-3 bg-[#FFF8E1] rounded-[10px] px-4 py-3">
                    <p className="text-[12px] text-[#9A6820] leading-relaxed">
                      {t(
                        `Your experience is real. Let's make sure it reads that way. ${result.gaps.length - 1} more gap${result.gaps.length > 2 ? "s" : ""} revealed in a session with Olivia.`,
                        `你的经验是真实的。让我们确保它能被清楚地展现出来。还有${result.gaps.length - 1}个差距将在Olivia的咨询中揭示。`
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* One quick win */}
              {result.quickWins.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-mid mb-2">
                    {t("One thing to fix this week", "本周可以改进的一件事")}
                  </p>
                  <div className="flex items-start gap-2 text-[13px] text-ink">
                    <span className="text-[#F5A800] mt-[2px] flex-shrink-0">★</span>
                    {result.quickWins[0]}
                  </div>
                </div>
              )}
            </Card>

            {/* Score-responsive CTA */}
            <DarkCard>
              {result.nextStep === "cv_session" && (
                <>
                  <p className="text-[14px] text-white/80 leading-relaxed mb-1 font-medium">
                    {t("Your CV has significant gaps for NZ ECE.", "你的简历在新西兰幼教方面存在明显差距。")}
                  </p>
                  <p className="text-[13px] text-white/55 leading-relaxed mb-4">
                    {t(
                      "Olivia reviews it personally and sends you a full written action plan within 48 hours.",
                      "Olivia亲自审阅，48小时内发送完整书面行动计划。"
                    )}
                  </p>
                  <Btn onClick={() => router.push("/book")} className="mb-2">
                    {t("Get a CV Review — $97", "获取简历审阅 — $97")}
                  </Btn>
                  <Btn variant="outline" onClick={() => router.push("/book")}
                    className="border-white/20 text-white/60 text-[13px] py-3">
                    {t("Or book a session — $167", "或预约咨询 — $167")}
                  </Btn>
                </>
              )}
              {result.nextStep === "full_package" && (
                <>
                  <p className="text-[14px] text-white/80 leading-relaxed mb-1 font-medium">
                    {t("Your CV is workable. The interview is the next hurdle.", "你的简历还可以。面试是下一关。")}
                  </p>
                  <p className="text-[13px] text-white/55 leading-relaxed mb-4">
                    {t(
                      "The Full Pathway covers both — and gives you 30 days of direct support.",
                      "全套方案覆盖两者，并提供30天直接支持。"
                    )}
                  </p>
                  <Btn onClick={() => router.push("/book")} className="mb-2">
                    {t("Book The Full Pathway — $597", "预约全套方案 — $597")}
                  </Btn>
                  <Btn variant="outline" onClick={() => router.push("/book")}
                    className="border-white/20 text-white/60 text-[13px] py-3">
                    {t("Or a single session — $167", "或单次咨询 — $167")}
                  </Btn>
                </>
              )}
              {result.nextStep === "interview_bank" && (
                <>
                  <p className="text-[14px] text-white/80 leading-relaxed mb-1 font-medium">
                    {t("Your CV is in good shape.", "你的简历状态不错。")}
                  </p>
                  <p className="text-[13px] text-white/55 leading-relaxed mb-4">
                    {t(
                      "You'll know what they're looking for before you walk in the door.",
                      "在进门之前，你就会知道他们在寻找什么。"
                    )}
                  </p>
                  <Btn onClick={() => router.push("/interview")} className="mb-2">
                    {t("Practice Interview Questions →", "练习面试题 →")}
                  </Btn>
                  <Btn variant="outline" onClick={() => router.push("/book")}
                    className="border-white/20 text-white/60 text-[13px] py-3">
                    {t("Or book the Full Pathway — $597", "或预约全套方案 — $597")}
                  </Btn>
                </>
              )}
            </DarkCard>

            <button onClick={() => { setStage("upload"); setResult(null); setFile(null); setText(""); setContact(undefined); }}
              className="text-[12px] text-mid underline text-center font-body">
              {t("Analyse a different CV", "分析其他简历")}
            </button>
          </div>
        )}
      </FunnelPage>
    </Shell>
  );
}
