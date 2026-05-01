"use client";

import { useState } from "react";
import { Btn } from "./ui";
import { useLang } from "./LangProvider";
import { saveLead as saveLeadLocal, getLead } from "@/lib/storage";

interface GateProps {
  icon: string;
  titleEn: string;
  titleZh: string;
  subEn: string;
  subZh: string;
  funnelType: string;
  onContinue: (contact?: string) => void;
  score?: number;
  notes?: Record<string, unknown>;
}

const NZ_DURATION_OPTIONS = [
  { en: "Less than 1 year",  zh: "不足1年" },
  { en: "1–3 years",         zh: "1-3年" },
  { en: "3–5 years",         zh: "3-5年" },
  { en: "5+ years",          zh: "5年以上" },
  { en: "Not in NZ yet",     zh: "还未在新西兰" },
];

export function Gate({ icon, titleEn, titleZh, subEn, subZh,
  funnelType, onContinue, score, notes }: GateProps) {
  const { t, lang } = useLang();
  const [contact,    setContact]    = useState("");
  const [city,       setCity]       = useState("");
  const [nzDuration, setNzDuration] = useState("");
  const [error,      setError]      = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [step,       setStep]       = useState<"contact" | "context">("contact");

  const submitContact = () => {
    if (!contact.trim()) { setError(true); setTimeout(() => setError(false), 1500); return; }
    // Save contact immediately to localStorage
    saveLeadLocal({ contact: contact.trim(), journeyType: funnelType });
    setStep("context");
  };

  const submitFull = async () => {
    setLoading(true);
    const source = getLead().trafficSource ?? undefined;

    // Fire to /api/leads with all context
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact:     contact.trim(),
        journey:     funnelType,
        score,
        lang,
        source,
        city:        city || undefined,
        nz_duration: nzDuration || undefined,
        notes,
      }),
    }).catch(() => {});

    setLoading(false);
    onContinue(contact.trim());
  };

  const skip = () => {
    // Save what we have even on skip
    if (contact.trim()) {
      const source = getLead().trafficSource ?? undefined;
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact:     contact.trim(),
          journey:     funnelType,
          score,
          lang,
          source,
          city:        city || undefined,
          nz_duration: nzDuration || undefined,
          notes,
        }),
      }).catch(() => {});
    }
    onContinue(contact.trim() || undefined);
  };

  return (
    <div className="bg-card rounded-app shadow-card p-7">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="font-display text-[26px] tracking-wide text-ink mb-2">
          {t(titleEn, titleZh)}
        </h3>
        <p className="text-[13px] text-mid leading-relaxed">{t(subEn, subZh)}</p>
      </div>

      {step === "contact" ? (
        <>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitContact()}
            placeholder={t("WeChat ID or email", "微信号或邮箱")}
            className={`w-full border-2 rounded-[10px] px-4 py-[13px] text-[14px] font-body
              text-ink bg-off outline-none transition-colors mb-3 placeholder:text-[#BDBDBD] ${
              error ? "border-danger" : "border-light focus:border-[#F5A800]"
            }`}
          />
          <Btn onClick={submitContact}>
            {t("Continue →", "继续 →")}
          </Btn>
          <button onClick={() => onContinue()} className="mt-3 text-[12px] text-mid underline font-body block w-full text-center">
            {t("Skip for now", "暂时跳过")}
          </button>
        </>
      ) : (
        <>
          {/* Step 2 — quick context, 2 optional fields */}
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-mid mb-3">
            {t("Two quick questions (optional)", "两个快速问题（可选）")}
          </p>

          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("Your city (e.g. Auckland, Wellington)", "你所在的城市（如奥克兰、惠灵顿）")}
            className="w-full border-2 border-light rounded-[10px] px-4 py-[13px] text-[14px]
              font-body text-ink bg-off outline-none focus:border-[#F5A800] transition-colors
              mb-3 placeholder:text-[#BDBDBD]"
          />

          <div className="mb-4">
            <p className="text-[12px] text-mid mb-2">{t("How long have you been in NZ?", "你在新西兰多久了？")}</p>
            <div className="flex flex-wrap gap-2">
              {NZ_DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.en}
                  onClick={() => setNzDuration(opt.en)}
                  className={`px-3 py-[7px] rounded-pill border text-[12px] font-body transition-all ${
                    nzDuration === opt.en
                      ? "bg-dark border-dark text-[#F5A800]"
                      : "bg-off border-light text-mid"
                  }`}
                >
                  {t(opt.en, opt.zh)}
                </button>
              ))}
            </div>
          </div>

          <Btn onClick={submitFull} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-ink/20 border-t-ink rounded-full animate-spin2" />
                {t("Saving...", "保存中...")}
              </span>
            ) : t("See My Results →", "查看我的结果 →")}
          </Btn>
          <button onClick={skip} className="mt-3 text-[12px] text-mid underline font-body block w-full text-center">
            {t("Skip and see results", "跳过，直接查看结果")}
          </button>
        </>
      )}

      <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-mid">
        <span>🔒</span>
        <span>{t("No spam. Olivia reads every submission personally.", "无垃圾邮件。Olivia亲自阅读每一份提交。")}</span>
      </div>
    </div>
  );
}
