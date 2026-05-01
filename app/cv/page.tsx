"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "components/Shell";
import { useLang } from "components/LangProvider";
import { Gate } from "components/Gate";
import {
  BackBtn, Btn, SectionLabel, ScreenTitle, ScreenSub,
  ScoreCircle, InsightBar, Card, DarkCard, Spinner,
} from "components/ui";
import { saveLead } from "lib/storage";
import type { CVAnalysisResult } from "../../lib/ai";

type Stage = "upload" | "gate" | "result";

export default function CVPage() {
  const router = useRouter();
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CVAnalysisResult | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setError("");
    // If text file, also preview in textarea
    if (f.name.endsWith(".txt")) {
      f.text().then(setText);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
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

  const runAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (text.trim()) formData.append("text", text.trim());

      const res = await fetch("/api/cv", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("Analysis failed. Please try again.", "分析失败，请重试。"));
        setStage("upload");
        return;
      }

      setResult(data as CVAnalysisResult);
      saveLead({ cvScore: data.score });
      setStage("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t("Something went wrong. Please try again.", "出现错误，请重试。"));
      setStage("upload");
    } finally {
      setLoading(false);
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
            "Upload your CV. AI analyses it specifically against NZ ECE hiring standards — not generic advice.",
            "上传你的简历，AI专门对照新西兰幼教招聘标准进行分析——不是泛泛建议。"
          )}
        </ScreenSub>

        {/* ── STAGE: UPLOAD ── */}
        {stage === "upload" && (
          <div className="animate-fadeUp flex flex-col gap-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-app p-8 text-center cursor-pointer transition-all ${
                dragging || file
                  ? "border-[#F5A800] bg-[#FFF8E1]"
                  : "border-light bg-card"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {file ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-semibold text-ink truncate">{file.name}</p>
                    <p className="text-[12px] text-mid">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setText(""); }}
                    className="text-mid text-lg leading-none p-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">📎</div>
                  <p className="text-[15px] font-semibold text-ink mb-1">
                    {t("Upload your CV", "上传你的简历")}
                  </p>
                  <p className="text-[12px] text-mid mb-3">
                    {t("Tap to browse or drag & drop", "点击浏览或拖放文件")}
                  </p>
                  <div className="flex justify-center gap-2">
                    {["PDF", "DOCX", "TXT"].map((ext) => (
                      <span key={ext} className="text-[10px] font-semibold tracking-wide bg-light text-mid px-[10px] py-1 rounded-lg">
                        {ext}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 text-[11px] text-mid">
              <div className="flex-1 h-px bg-light" />
              <span>{t("or paste text below", "或在下方粘贴文字")}</span>
              <div className="flex-1 h-px bg-light" />
            </div>

            {/* Text area */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t(
                "Paste your CV text here...",
                "在此粘贴简历内容..."
              )}
              className="w-full h-[120px] border-2 border-light rounded-[10px] px-4 py-3 text-[13px] font-body text-ink bg-card resize-none outline-none focus:border-[#F5A800] transition-colors placeholder:text-[#BDBDBD] leading-relaxed"
            />

            {error && (
              <p className="text-[13px] text-danger text-center">{error}</p>
            )}

            <Btn onClick={handleAnalyseClick} disabled={!canProceed}>
              {t("Analyse My CV →", "分析我的简历 →")}
            </Btn>
          </div>
        )}

        {/* ── STAGE: GATE ── */}
        {stage === "gate" && !loading && (
          <div className="animate-fadeUp">
            <Gate
              icon="📊"
              titleEn="Ready to analyse!"
              titleZh="准备分析！"
              subEn="Where should we send your CV report? Olivia personally reviews every submission."
              subZh="我们应该把简历报告发送到哪里？Olivia亲自审阅每一份提交。"
              funnelType="cv"
              onContinue={() => runAnalysis()}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="animate-fadeUp">
            <Card className="flex flex-col items-center py-10 gap-4">
              <Spinner />
              <p className="text-[14px] text-mid">
                {t(
                  "Analysing against NZ ECE standards...",
                  "正在对照新西兰幼教标准分析..."
                )}
              </p>
              <p className="text-[12px] text-mid/60">
                {t("This takes about 15 seconds", "大约需要15秒")}
              </p>
            </Card>
          </div>
        )}

        {/* ── STAGE: RESULT ── */}
        {stage === "result" && result && (
          <div className="animate-fadeUp flex flex-col gap-4">
            {/* Score card */}
            <Card>
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-light">
                <ScoreCircle score={result.score} band={result.band} />
                <div>
                  <p className="text-[15px] font-semibold text-ink mb-1">{result.headline}</p>
                  <p className="text-[12px] text-mid">
                    {t("Scored against NZ ECE standards", "对照新西兰幼教标准评分")}
                  </p>
                </div>
              </div>

              <InsightBar>
                <strong className="text-[#C98500]">
                  {t("💡 Key insight: ", "💡 核心洞察：")}
                </strong>
                {result.keyInsight}
              </InsightBar>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-mid mb-2">
                    {t("Strengths", "优势")}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-ink">
                        <span className="text-sage mt-[2px]">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {result.gaps.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-mid mb-2">
                    {t("Gaps to Address", "需要改进")}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-ink">
                        <span className="text-danger mt-[2px]">→</span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick wins */}
              {result.quickWins.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-mid mb-2">
                    {t("Quick Wins This Week", "本周快速改进")}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {result.quickWins.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-ink">
                        <span className="text-[#F5A800] mt-[2px]">★</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Score-responsive CTA */}
            <DarkCard>
              {result.nextStep === "cv_session" && (
                <>
                  <p className="text-[14px] text-white/80 leading-relaxed mb-4">
                    {t(
                      "Your CV needs some work before you apply more. Let Olivia review it personally and give you a detailed action plan.",
                      "在你继续投简历之前，需要先改进简历。让Olivia亲自审阅并给你详细的行动计划。"
                    )}
                  </p>
                  <Btn onClick={() => router.push("/book")}>
                    {t("Book a CV Session — $149", "预约简历审阅 — $149")}
                  </Btn>
                </>
              )}

              {result.nextStep === "full_package" && (
                <>
                  <p className="text-[14px] text-white/80 leading-relaxed mb-4">
                    {t(
                      "Your CV is workable — but to get hired you'll need both a stronger CV and solid interview prep. The Full Pathway covers both.",
                      "你的简历还可以，但要成功获聘，你需要更强的简历和扎实的面试准备。全套方案覆盖两者。"
                    )}
                  </p>
                  <Btn onClick={() => router.push("/book")} className="mb-2">
                    {t("Book The Full Pathway — $599", "预约全套方案 — $599")}
                  </Btn>
                  <Btn
                    variant="outline"
                    onClick={() => router.push("/book")}
                    className="border-white/20 text-white/70"
                  >
                    {t("Or book a single session — $149", "或预约单次咨询 — $149")}
                  </Btn>
                </>
              )}

              {result.nextStep === "interview_bank" && (
                <>
                  <p className="text-[14px] text-white/80 leading-relaxed mb-4">
                    {t(
                      "Your CV is in good shape. The next thing that will make or break your application is the interview.",
                      "你的简历状态不错。决定你能否成功的下一关是面试。"
                    )}
                  </p>
                  <Btn onClick={() => router.push("/interview")} className="mb-2">
                    {t("Practice Interview Questions →", "练习面试题 →")}
                  </Btn>
                  <Btn
                    variant="outline"
                    onClick={() => router.push("/book")}
                    className="border-white/20 text-white/70"
                  >
                    {t("Or book the Full Pathway — $599", "或预约全套方案 — $599")}
                  </Btn>
                </>
              )}
            </DarkCard>

            {/* Restart */}
            <button
              onClick={() => { setStage("upload"); setResult(null); setFile(null); setText(""); }}
              className="text-[12px] text-mid underline text-center font-body"
            >
              {t("Analyse a different CV", "分析其他简历")}
            </button>
          </div>
        )}
      </FunnelPage>
    </Shell>
  );
}
