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
  /** Called after contact is captured (or skipped) */
  onContinue: (contact?: string) => void;
  /** Optional score or extra data to attach to the lead */
  score?: number;
  notes?: Record<string, unknown>;
}

export function Gate({
  icon,
  titleEn,
  titleZh,
  subEn,
  subZh,
  funnelType,
  onContinue,
  score,
  notes,
}: GateProps) {
  const { t, lang } = useLang();
  const [contact, setContact] = useState("");
  const [error, setError]     = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (value?: string) => {
    const finalContact = value?.trim() ?? "";

    // Always save to localStorage immediately
    if (finalContact) {
      saveLeadLocal({ contact: finalContact, journeyType: funnelType });
    }

    // Fire-and-forget to /api/leads — never blocks user
    if (finalContact) {
      const source = getLead().trafficSource ?? undefined;
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: finalContact,
          journey: funnelType,
          score,
          lang,
          source,
          notes,
        }),
      }).catch(() => {});
    }

    onContinue(finalContact || undefined);
  };

  const handleSubmit = async () => {
    if (!contact.trim()) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setLoading(true);
    await submit(contact.trim());
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-app shadow-card p-7 text-center">
      <div className="text-5xl mb-4">{icon}</div>

      <h3 className="font-display text-[26px] tracking-wide text-ink mb-2">
        {t(titleEn, titleZh)}
      </h3>
      <p className="text-[13px] text-mid leading-relaxed mb-6">
        {t(subEn, subZh)}
      </p>

      <input
        type="text"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={t("WeChat ID or email", "微信号或邮箱")}
        className={`w-full border-2 rounded-[10px] px-4 py-[13px] text-[14px] font-body
          text-ink bg-off outline-none transition-colors mb-3 placeholder:text-[#BDBDBD] ${
          error ? "border-danger" : "border-light focus:border-[#F5A800]"
        }`}
      />

      <Btn onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-ink/20 border-t-ink rounded-full animate-spin2" />
            {t("Saving...", "保存中...")}
          </span>
        ) : (
          t("See My Results →", "查看我的结果 →")
        )}
      </Btn>

      <button
        onClick={() => submit()}
        className="mt-3 text-[12px] text-mid underline font-body cursor-pointer block w-full"
      >
        {t("Skip for now", "暂时跳过")}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-mid">
        <span>🔒</span>
        <span>
          {t(
            "No spam. Olivia reads every submission personally.",
            "无垃圾邮件。Olivia亲自阅读每一份提交。"
          )}
        </span>
      </div>
    </div>
  );
}
