"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "components/Shell";
import { useLang } from "components/LangProvider";
import { BackBtn, Btn, SectionLabel, ScreenTitle, ScreenSub, DarkCard } from "components/ui";
import { saveLead } from "lib/storage";

const NEEDS = [
  { v: "cv",           en: "Getting my CV right for NZ ECE",       zh: "优化新西兰幼教简历" },
  { v: "interview",    en: "Interview preparation",                  zh: "面试准备" },
  { v: "registration", en: "Teacher Council registration",           zh: "教师委员会注册" },
  { v: "career",       en: "Career direction and planning",          zh: "职业方向和规划" },
  { v: "workplace",    en: "Workplace or management issues",         zh: "职场或管理问题" },
];

const TIMELINES = [
  { v: "urgent",     en: "I need help now — actively applying",    zh: "现在就需要——正在投简历" },
  { v: "soon",       en: "Within the next 1–2 months",             zh: "未来1-2个月内" },
  { v: "exploring",  en: "Just exploring my options",              zh: "只是了解选项" },
];

interface Rec {
  title: string; titleZh: string;
  price: string;
  why: string; whyZh: string;
  cta: string; ctaZh: string;
}

function getRecommendation(need: string, timeline: string): Rec {
  if (need === "workplace") {
    return {
      title: "Free Discovery Call", titleZh: "免费探索通话",
      price: "Free",
      why: "Workplace situations are personal and complex. Start with a free 15-minute call — no obligation, no charge. Olivia will give you honest guidance on next steps.",
      whyZh: "职场情况既个人又复杂。从15分钟免费通话开始——无义务，无费用。Olivia将给你诚实的指导。",
      cta: "Book a Free Call", ctaZh: "预约免费通话",
    };
  }
  if (timeline === "urgent") {
    return {
      title: "The Full Pathway", titleZh: "全套方案",
      price: "$599 NZD",
      why: "Given your timeline, the full package gives you everything in one plan — CV, interviews, registration and 30 days of direct support. The fastest path to an offer.",
      whyZh: "鉴于你的时间安排，全套方案将所有内容整合在一个计划中——简历、面试、注册和30天直接支持。最快的求职路径。",
      cta: "Book The Full Pathway", ctaZh: "预约全套方案",
    };
  }
  return {
    title: "The Clarity Session", titleZh: "单次咨询",
    price: "$149 NZD",
    why: "One focused 60-minute session where you pick the topic. The clearest, lowest-risk way to get Olivia's expert eyes on your specific situation.",
    whyZh: "专注60分钟，自选主题。获得Olivia专业建议的最清晰、风险最低的方式。",
    cta: "Book The Clarity Session", ctaZh: "预约单次咨询",
  };
}

export default function BookPage() {
  const router = useRouter();
  const { t } = useLang();
  const [need, setNeed] = useState("");
  const [timeline, setTimeline] = useState("");
  const [showCal, setShowCal] = useState(false);

  const selectNeed = (v: string) => { setNeed(v); saveLead({ bookingNeed: v }); };
  const selectTimeline = (v: string) => { setTimeline(v); saveLead({ bookingTimeline: v }); };

  const rec = need && timeline ? getRecommendation(need, timeline) : null;

  return (
    <Shell>
      <FunnelPage>
        <BackBtn onClick={() => router.push("/journey")} label={t("Back", "返回")} />
        <SectionLabel>{t("Book a Session", "预约咨询")}</SectionLabel>
        <ScreenTitle>{t("LET'S FIND\nTHE RIGHT FIT.", "找到最合适\n的方案")}</ScreenTitle>
        <ScreenSub>{t("Two quick questions — then we'll recommend exactly what you need.", "两个简单问题——我们为你推荐最合适的方案。")}</ScreenSub>

        <div className="flex flex-col gap-6 mb-6">
          {/* Need */}
          <div>
            <p className="text-[11px] font-semibold tracking-[1px] uppercase text-mid mb-3">
              {t("What do you need most help with?", "你最需要哪方面的帮助？")}
            </p>
            <div className="flex flex-col gap-2">
              {NEEDS.map((n) => (
                <button key={n.v} onClick={() => selectNeed(n.v)}
                  className={`text-left px-4 py-[13px] rounded-[10px] border-2 text-[13px] font-body transition-all ${
                    need === n.v ? "border-[#F5A800] bg-[#FFF8E1] text-ink" : "border-light bg-card text-ink"
                  }`}>
                  {t(n.en, n.zh)}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-[11px] font-semibold tracking-[1px] uppercase text-mid mb-3">
              {t("What's your timeline?", "你的时间安排是？")}
            </p>
            <div className="flex flex-col gap-2">
              {TIMELINES.map((tl) => (
                <button key={tl.v} onClick={() => selectTimeline(tl.v)}
                  className={`text-left px-4 py-[13px] rounded-[10px] border-2 text-[13px] font-body transition-all ${
                    timeline === tl.v ? "border-[#F5A800] bg-[#FFF8E1] text-ink" : "border-light bg-card text-ink"
                  }`}>
                  {t(tl.en, tl.zh)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {rec && !showCal && (
          <DarkCard className="animate-fadeUp mb-4">
            <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#F5A800] mb-2">
              {t("Our recommendation for you", "我们为你的推荐")}
            </p>
            <p className="font-display text-[26px] tracking-wide text-white mb-1">{t(rec.title, rec.titleZh)}</p>
            <p className="text-[28px] font-bold text-[#F5A800] mb-3">{rec.price}</p>
            <p className="text-[13px] text-white/65 leading-relaxed mb-5">{t(rec.why, rec.whyZh)}</p>
            <Btn onClick={() => setShowCal(true)}>
              {t(rec.cta + " →", rec.ctaZh + " →")}
            </Btn>
          </DarkCard>
        )}

        {/* Calendly placeholder */}
        {showCal && (
          <div className="animate-fadeUp">
            <div className="border-2 border-dashed border-[#F5A800]/30 rounded-app p-10 text-center bg-dark mb-4">
              <p className="text-[13px] text-white/40 mb-2">📅 {t("Calendly booking widget goes here", "Calendly预约组件将在此处显示")}</p>
              <p className="text-[11px] text-white/20">{t("Replace with your Calendly embed code", "替换为你的Calendly嵌入代码")}</p>
            </div>
            <a href="mailto:olivia@nzececonsult.co.nz" className="flex items-center justify-center gap-2 w-full bg-dark text-white rounded-app py-4 text-[14px] font-semibold font-body">
              {t("Or Email Olivia Directly", "或直接发邮件给Olivia")}
            </a>
          </div>
        )}
      </FunnelPage>
    </Shell>
  );
}
