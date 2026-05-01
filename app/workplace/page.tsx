"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "@/components/Shell";
import { useLang } from "@/components/LangProvider";
import { BackBtn, Btn, SectionLabel, ScreenTitle, Card, DarkCard, Spinner } from "@/components/ui";
import { WORKPLACE_SITUATIONS } from "@/lib/data";
import { saveLead } from "@/lib/storage";
import type { WorkplaceGuidanceResult } from "@/lib/ai";

export default function WorkplacePage() {
  const router = useRouter();
  const { t } = useLang();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkplaceGuidanceResult | null>(null);

  const select = async (id: string) => {
    setSelected(id);
    setLoading(true);
    saveLead({ workplaceSituation: id });
    try {
      const res = await fetch("/api/workplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situationId: id }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        validation: "What you're experiencing is real, and you are not alone. Many Chinese ECE professionals in NZ face similar challenges — and it takes courage to seek help.",
        guidance: ["Document incidents with dates and specific details.", "Speak with your centre director or a trusted colleague first.", "Know your right to raise a personal grievance under NZ law."],
        nzContext: "Employment NZ (0800 20 90 20) offers free, confidential advice on your workplace rights under the Employment Relations Act 2000.",
        reminder: "This situation does not define your career or your worth as an ECE professional.",
      });
    }
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Shell>
      <FunnelPage>
        <BackBtn onClick={() => router.push("/journey")} label={t("Back", "返回")} />
        <SectionLabel>{t("Workplace Support", "职场支持")}</SectionLabel>
        <ScreenTitle>{t("YOU ARE\nNOT ALONE.", "你并不孤单。")}</ScreenTitle>

        {!result && !loading && (
          <div className="animate-fadeUp">
            <DarkCard className="mb-5">
              <p className="text-[13px] text-white/65 leading-relaxed">
                {t(
                  "Many Chinese ECE professionals in NZ face these challenges — most suffer in silence because they don't know where to turn. This is a free, confidential space.",
                  "许多在新西兰的华人幼教专业人士都面临同样的挑战——大多数人默默承受，因为不知道该向谁求助。这是一个免费、保密的空间。"
                )}
              </p>
            </DarkCard>

            <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-mid mb-3">
              {t("What best describes your situation?", "哪项最符合你的情况？")}
            </p>

            <div className="flex flex-col gap-3">
              {WORKPLACE_SITUATIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => select(s.id)}
                  className={`flex items-center gap-4 bg-card border-2 rounded-[10px] p-4 text-left shadow-card transition-all active:scale-[0.99] w-full ${
                    selected === s.id ? "border-[#F5A800] bg-[#FFF8E1]" : "border-light"
                  }`}
                >
                  <span className="text-[22px] w-8 text-center flex-shrink-0">{s.icon}</span>
                  <div>
                    <strong className="block text-[13px] font-medium text-ink mb-[2px]">
                      {t(s.en, s.zh)}
                    </strong>
                    <span className="text-[11px] text-mid">{t(s.subEn, s.subZh)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <Card className="flex flex-col items-center py-10 gap-4">
            <Spinner />
            <p className="text-[14px] text-mid">{t("Preparing guidance for you...", "正在为你准备指导...")}</p>
          </Card>
        )}

        {result && !loading && (
          <div className="animate-fadeUp flex flex-col gap-4">
            <Card>
              <p className="text-[14px] text-ink leading-relaxed mb-4 italic">
                "{result.validation}"
              </p>

              <p className="text-[11px] font-semibold uppercase tracking-wide text-mid mb-3">
                {t("What you can do", "你可以这样做")}
              </p>
              <ul className="flex flex-col gap-3 mb-4">
                {result.guidance.map((g, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-ink">
                    <span className="w-6 h-6 rounded-full bg-[#FFF8E1] text-[#C98500] flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-[1px]">
                      {i + 1}
                    </span>
                    {g}
                  </li>
                ))}
              </ul>

              <div className="bg-[#EEF5EF] rounded-[10px] p-3 mb-3">
                <p className="text-[12px] text-sage leading-relaxed">
                  <strong>⚖️ {t("NZ Rights: ", "新西兰权利：")}</strong>
                  {result.nzContext}
                </p>
              </div>

              <p className="text-[13px] text-mid italic">{result.reminder}</p>
            </Card>

            <DarkCard>
              <p className="text-[14px] text-white/80 leading-relaxed mb-4">
                {t(
                  "Olivia has helped many people through exactly this. Would you like to talk it through — no charge, no agenda?",
                  "Olivia帮助过许多经历同样情况的人。你愿意免费、无压力地聊一聊吗？"
                )}
              </p>
              <Btn onClick={() => router.push("/book")} className="mb-2">
                {t("Yes, I'd Like to Talk to Olivia", "是的，我想和Olivia聊聊")}
              </Btn>
              <button
                onClick={() => setResult(null)}
                className="w-full text-center text-[12px] text-white/40 font-body"
              >
                {t("That helped, thank you", "这很有帮助，谢谢")}
              </button>
            </DarkCard>
          </div>
        )}
      </FunnelPage>
    </Shell>
  );
}
