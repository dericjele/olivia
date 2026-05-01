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
  const router = useRouter();
  const { t, lang } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  const [stage,   setStage]   = useState<Stage>("upload");
  const [file,    setFile]    = useState<File | null>(null);
  const [text,    setText]    = useState("");
  const [dragging,setDragging]= useState(false);
  const [error,   setError]   = useState("");
  const [result,  setResult]  = useState<CVAnalysisResult | null>(null);
  // Store contact so we can use it AFTER analysis completes
  const [contact, setContact] = useState<string | undefined>();

  const handleFile = (f: File) => {
    setFile(f);
    setError("");
    if (f.name.endsWith(".txt")) f.text().then(setText);
  };

  const canProceed = file !== null || text.trim().length > 40;

  const handleAnalyseClick = () => {
    if (!canProceed) {
      setError(t("Please upload a file or paste your CV text.", "请上传文件或粘贴简历内容。"));
      return;
    }
    setStage("gate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Called by Gate — contact captured, now run analysis
  const onGateContinue = (capturedContact?: string) => {
    setContact(capturedContact);
    // Save to localStorage immediately
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

      if (!res.ok) {
        setError(data.error || t("Analysis failed.", "分析失败。"));
        setStage("upload");
        return;
      }

      const cvResult = data as CVAnalysisResult;
      setResult(cvResult);

      // NOW save the full lead with score + rich notes
      // This is the second write — first write was in Gate (contact only)
      // We update with the score and analysis results
      if (capturedContact) {
        const source = getLead().trafficSource ?? undefined;
        fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact:  capturedContact,
            journey:  "cv",
            score:    cvResult.score,
            lang,
            source,
            notes: {
              cv_score:       cvResult.score,
              cv_band:        cvResult.band,
              cv_headline:    cvResult.headline,
              cv_key_insight: cvResult.keyInsight,
              cv_gaps:        cvResult.gaps?.join(" | "),
              cv_strengths:   cvResult.strengths?.join(" | "),
              cv_quick_wins:  cvResult.quickWins?.join(" | "),
              cv_next_step:   cvResult.nextStep,
              file_type:      file?.name.split(".").pop() ?? "text",
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
        <ScreenTitle>{t("LET'S CHECK\nYOUR CV.", "检查你的简历")}</ScreenTitle>
        <ScreenSub>
          {t(
            "Upload your CV. AI checks it against NZ ECE hiring standards — specific, not generic.",
            "上传你的简历，AI专门对照新西兰幼教招聘标准进行分析。"
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
              {t("Analyse My CV →", "分析我的简历 →")}
            </Btn>
          </div>
        )}

        {/* ── GATE ── */}
        {stage === "gate" && (
          <div className="animate-fadeUp">
            <Gate
              icon="📊"
              titleEn="Almost there!"
              titleZh="即将完成！"
              subEn="Where should we send your CV report? Olivia personally reviews every submission."
              subZh="我们应该把简历报告发送到哪里？Olivia亲自审阅每一份提交。"
              funnelType="cv"
              onContinue={onGateContinue}
            />
          </div>
        )}

        {/* ── ANALYSING ── */}
        {stage === "analysing" && (
          <Card className="flex flex-col items-center py-10 gap-4">
            <Spinner />
            <p className="text-[14px] text-mid">{t("Analysing against NZ ECE standards...", "正在对照新西兰幼教标准分析...")}</p>
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
                  <p className="text-[12px] text-mid">{t("Scored against NZ ECE standards", "对照新西兰幼教标准评分")}</p>
                </div>
              </div>

              <InsightBar>
                <strong className="text-[#C98500]">{t("💡 Key insight: ", "💡 核心洞察：")}</strong>
                {result.keyInsight}
              </InsightBar>

              {/* Strengths — always show */}
              {result.strengths.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-mid mb-2">{t("Strengths", "优势")}</p>
                  <ul className="flex flex-col gap-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-ink">
                        <span className="text-sage mt-[2px]">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps — show first gap free, rest blurred */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-mid mb-2">{t("Gaps to Address", "需要改进")}</p>
                <ul className="flex flex-col gap-2">
                  {result.gaps.map((g, i) => (
                    <li key={i} className={`flex items-start gap-2 text-[13px] transition-all ${
                      i === 0 ? "text-ink" : "blur-sm select-none text-mid"
                    }`}>
                      <span className="text-danger mt-[2px] flex-shrink-0">→</span>{g}
                    </li>
                  ))}
                </ul>
                {result.gaps.length > 1 && (
                  <p className="text-[11px] text-mid mt-2 italic">
                    {t(
                      `+${result.gaps.length - 1} more gaps — revealed in a CV session with Olivia`,
                      `还有${result.gaps.length - 1}个差距——在Olivia的简历咨询中揭示`
                    )}
                  </p>
                )}
              </div>

              {/* Quick wins — show first one free */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-mid mb-2">{t("Quick Win This Week", "本周快速改进")}</p>
                <div className="flex items-start gap-2 text-[13px] text-ink">
                  <span className="text-[#F5A800] mt-[2px]">★</span>
                  {result.quickWins[0]}
                </div>
              </div>
            </Card>

            {/* Score-responsive CTA */}
            <DarkCard>
              {result.nextStep === "cv_session" && (
                <>
                  <p className="text-[14px] text-white/80 leading-relaxed mb-4">
                    {t(
                      "Your CV has significant gaps for NZ ECE. Let Olivia review it personally — you'll get a full action plan within 48 hours.",
                      "你的简历在新西兰幼教方面存在明显差距。让Olivia亲自审阅——48小时内获得完整行动计划。"
                    )}
                  </p>
                  <Btn onClick={() => router.push("/book")} className="mb-2">
                    {t("Book a CV Session — $167", "预约简历咨询 — $167")}
                  </Btn>
                  <Btn variant="outline" onClick={() => router.push("/book")}
                    className="border-white/20 text-white/70 text-[13px] py-3">
                    {t("Or get an async CV review — $97", "或获取异步简历审阅 — $97")}
                  </Btn>
                </>
              )}
              {result.nextStep === "full_package" && (
                <>
                  <p className="text-[14px] text-white/80 leading-relaxed mb-4">
                    {t(
                      "Your CV is workable but interviews will be the next hurdle. The Full Pathway covers both.",
                      "你的简历还可以，但面试将是下一个关卡。全套方案覆盖两者。"
                    )}
                  </p>
                  <Btn onClick={() => router.push("/book")} className="mb-2">
                    {t("Book The Full Pathway — $597", "预约全套方案 — $597")}
                  </Btn>
                  <Btn variant="outline" onClick={() => router.push("/book")}
                    className="border-white/20 text-white/70 text-[13px] py-3">
                    {t("Or a single session — $167", "或单次咨询 — $167")}
                  </Btn>
                </>
              )}
              {result.nextStep === "interview_bank" && (
                <>
                  <p className="text-[14px] text-white/80 leading-relaxed mb-4">
                    {t(
                      "Your CV is in good shape. The interview is what will make or break your application now.",
                      "你的简历状态不错。现在决定成败的是面试。"
                    )}
                  </p>
                  <Btn onClick={() => router.push("/interview")} className="mb-2">
                    {t("Practice Interview Questions →", "练习面试题 →")}
                  </Btn>
                  <Btn variant="outline" onClick={() => router.push("/book")}
                    className="border-white/20 text-white/70 text-[13px] py-3">
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
