"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "components/Shell";
import { useLang } from "components/LangProvider";
import { BackBtn, Btn, SectionLabel, ScreenTitle, ScreenSub } from "components/ui";
import { saveLead } from "lib/storage";

const JOURNEYS = [
  {
    emoji: "🌱", bg: "#FEF3E2",
    en: "Just starting to explore",
    zh: "刚开始了解",
    subEn: "Curious about NZ ECE — not sure where to begin",
    subZh: "对新西兰幼教感兴趣，不知从哪里开始",
    route: "/quiz",
    type: "quiz",
  },
  {
    emoji: "🎓", bg: "#FDE8DC",
    en: "I have a qualification",
    zh: "我已有相关资质",
    subEn: "Trained overseas — need to understand NZ registration",
    subZh: "海外培训——需要了解新西兰注册流程",
    route: "/pathway",
    type: "pathway",
  },
  {
    emoji: "🔍", bg: "#E8F4FD",
    en: "Actively job hunting",
    zh: "正在积极找工作",
    subEn: "Applying now — need my CV and interviews sorted",
    subZh: "正在投简历——需要优化简历和面试准备",
    route: "/cv",
    type: "cv",
  },
];

const WORKING_SUBS = [
  {
    emoji: "🎤", bg: "#EEF5EF",
    en: "I want to grow my career",
    zh: "我想发展职业",
    subEn: "Interview prep, registration, next steps",
    subZh: "面试准备、注册、下一步",
    route: "/interview",
    type: "interview",
  },
  {
    emoji: "🤝", bg: "#FEE8E8",
    en: "I need workplace support",
    zh: "我需要职场支持",
    subEn: "Difficult environment, management, cultural challenges",
    subZh: "困难环境、管理问题、文化挑战",
    route: "/workplace",
    type: "workplace",
  },
];

export default function JourneyPage() {
  const router = useRouter();
  const { t } = useLang();
  const [workingExpanded, setWorkingExpanded] = useState(false);

  const go = (route: string, type: string) => {
    saveLead({ journeyType: type });
    router.push(route);
  };

  return (
    <Shell>
      <FunnelPage>
        <BackBtn onClick={() => router.push("/")} label={t("Back", "返回")} />

        <SectionLabel>{t("Your Path", "你的路径")}</SectionLabel>
        <ScreenTitle>{t("WHERE ARE YOU\nRIGHT NOW?", "你目前处于\n哪个阶段？")}</ScreenTitle>
        <ScreenSub>
          {t(
            "Be honest — each path leads somewhere different and specific.",
            "如实选择——每条路径都通向不同的专属内容。"
          )}
        </ScreenSub>

        <div className="flex flex-col gap-3">
          {/* Standard journey cards */}
          {JOURNEYS.map((j) => (
            <button
              key={j.type}
              onClick={() => go(j.route, j.type)}
              className="flex items-center gap-4 bg-card border-2 border-light rounded-app p-5 text-left shadow-card active:scale-[0.99] active:border-[#F5A800] transition-all w-full"
            >
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] flex-shrink-0"
                style={{ background: j.bg }}
              >
                {j.emoji}
              </div>
              <div className="flex-1">
                <strong className="block text-[14px] font-semibold text-ink mb-1">
                  {t(j.en, j.zh)}
                </strong>
                <span className="text-[12px] text-mid leading-snug">
                  {t(j.subEn, j.subZh)}
                </span>
              </div>
              <span className="text-[#F5A800] text-xl font-bold flex-shrink-0">›</span>
            </button>
          ))}

          {/* Working in ECE — expands to 2 sub-options */}
          <div>
            <button
              onClick={() => setWorkingExpanded(!workingExpanded)}
              className={`flex items-center gap-4 bg-card border-2 rounded-app p-5 text-left shadow-card active:scale-[0.99] transition-all w-full ${
                workingExpanded ? "border-[#F5A800]" : "border-light"
              }`}
            >
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] flex-shrink-0 bg-[#EEF5EF]">
                🌟
              </div>
              <div className="flex-1">
                <strong className="block text-[14px] font-semibold text-ink mb-1">
                  {t("Already working in NZ ECE", "已在新西兰幼教行业工作")}
                </strong>
                <span className="text-[12px] text-mid leading-snug">
                  {t("Want to grow, progress or get support", "想要成长、晋升或获得支持")}
                </span>
              </div>
              <span className={`text-[#F5A800] text-xl font-bold flex-shrink-0 transition-transform duration-200 ${workingExpanded ? "rotate-90" : ""}`}>
                ›
              </span>
            </button>

            {/* Sub-options */}
            {workingExpanded && (
              <div className="mt-3 ml-4 flex flex-col gap-2 animate-fadeUp">
                {WORKING_SUBS.map((s) => (
                  <button
                    key={s.type}
                    onClick={() => go(s.route, s.type)}
                    className="flex items-center gap-3 bg-off border-2 border-light rounded-[10px] p-4 text-left active:border-[#F5A800] active:bg-[#FFF8E1] transition-all w-full"
                  >
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0"
                      style={{ background: s.bg }}
                    >
                      {s.emoji}
                    </div>
                    <div>
                      <strong className="block text-[13px] font-medium text-ink mb-[2px]">
                        {t(s.en, s.zh)}
                      </strong>
                      <span className="text-[11px] text-mid">
                        {t(s.subEn, s.subZh)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </FunnelPage>
    </Shell>
  );
}
