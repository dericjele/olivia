"use client";

import { useState } from "react";
import { Btn } from "./ui";
import { useLang } from "./LangProvider";
import { saveContact } from "lib/storage";

interface GateProps {
  icon: string;
  titleEn: string;
  titleZh: string;
  subEn: string;
  subZh: string;
  funnelType: string;
  onContinue: (contact?: string) => void;
}

export function Gate({
  icon,
  titleEn,
  titleZh,
  subEn,
  subZh,
  funnelType,
  onContinue,
}: GateProps) {
  const { t } = useLang();
  const [contact, setContact] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!contact.trim()) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    saveContact(contact.trim(), funnelType);
    onContinue(contact.trim());
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
        className={`w-full border-2 rounded-[10px] px-4 py-[13px] text-[14px] font-body text-ink bg-off outline-none transition-colors mb-3 ${
          error ? "border-danger" : "border-light focus:border-[#F5A800]"
        }`}
      />

      <Btn onClick={handleSubmit} variant="yellow">
        {t("See My Results →", "查看我的结果 →")}
      </Btn>

      <button
        onClick={() => onContinue()}
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
