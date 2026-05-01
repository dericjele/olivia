"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "components/Shell";
import { useLang } from "components/LangProvider";
import { BackBtn, Btn, SectionLabel, ScreenTitle, ScreenSub } from "components/ui";
import { INTERVIEW_QUESTIONS } from "lib/data";

type Cat = "all" | "values" | "behaviour" | "curriculum" | "culture";

const CATS: { id: Cat; en: string; zh: string }[] = [
  { id: "all",        en: "All",        zh: "全部" },
  { id: "values",     en: "Values",     zh: "价值观" },
  { id: "behaviour",  en: "Behaviour",  zh: "行为" },
  { id: "curriculum", en: "Curriculum", zh: "课程" },
  { id: "culture",    en: "Culture",    zh: "文化" },
];

export default function InterviewPage() {
  const router = useRouter();
  const { t } = useLang();

  const [cat, setCat] = useState<Cat>("all");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [openedCount, setOpenedCount] = useState(0);
  const [modalDismissed, setModalDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pillVisible, setPillVisible] = useState(false);

  const filtered =
    cat === "all" ? INTERVIEW_QUESTIONS : INTERVIEW_QUESTIONS.filter((q) => q.cat === cat);

  const toggleQ = (idx: number) => {
    const wasOpen = openIdx === idx;
    setOpenIdx(wasOpen ? null : idx);

    if (!wasOpen) {
      const newCount = openedCount + 1;
      setOpenedCount(newCount);
      if (newCount >= 2 && !modalDismissed) {
        setTimeout(() => {
          setShowModal(true);
          setPillVisible(true);
        }, 600);
      }
    }
  };

  const dismissModal = () => {
    setShowModal(false);
    setModalDismissed(true);
    setPillVisible(true); // keep pill visible
  };

  return (
    <Shell>
      <FunnelPage>
        <BackBtn onClick={() => router.push("/journey")} label={t("Back", "返回")} />

        <SectionLabel>{t("Interview Bank", "面试题库")}</SectionLabel>
        <ScreenTitle>{t("REAL NZ ECE\nINTERVIEW\nQUESTIONS.", "真实新西兰\n幼教面试题")}</ScreenTitle>
        <ScreenSub>
          {t(
            "Free. Olivia's insider tips on every question.",
            "免费。每道题都有Olivia的内部建议。"
          )}
        </ScreenSub>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`flex-shrink-0 px-4 py-[7px] rounded-pill border-2 text-[12px] font-semibold font-body transition-all whitespace-nowrap ${
                cat === c.id
                  ? "bg-dark border-dark text-[#F5A800]"
                  : "bg-card border-light text-mid"
              }`}
            >
              {t(c.en, c.zh)}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-[10px] mb-6">
          {filtered.map((item, i) => (
            <div
              key={i}
              className={`bg-card rounded-[10px] shadow-card border-2 transition-all ${
                openIdx === i ? "border-[#F5A800]" : "border-transparent"
              }`}
            >
              <button
                onClick={() => toggleQ(i)}
                className="w-full flex items-start justify-between gap-3 p-4 text-left"
              >
                <span className="text-[13px] font-medium text-ink leading-snug flex-1">
                  {item.q}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] flex-shrink-0 transition-all ${
                    openIdx === i
                      ? "bg-[#F5A800] text-ink rotate-180"
                      : "bg-light text-mid"
                  }`}
                >
                  ⌄
                </div>
              </button>

              {openIdx === i && (
                <div className="px-4 pb-4 animate-fadeUp">
                  <div className="pt-3 border-t border-light">
                    <p className="text-[12px] text-mid leading-relaxed mb-3">{item.a}</p>
                    <div className="bg-[#FFF8E1] rounded-[8px] p-3 mb-3">
                      <p className="text-[11px] text-[#9A6820] leading-relaxed">
                        <strong className="text-[#C98500]">💡 Olivia's tip: </strong>
                        {item.tip}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/book")}
                      className="text-[12px] font-semibold text-[#C98500] font-body"
                    >
                      {t("Practice this live with Olivia →", "与Olivia现场练习 →")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Persistent bottom CTA */}
        {pillVisible && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-40px)] max-w-[390px]">
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-between bg-dark text-white rounded-app px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] active:scale-[0.98] transition-all"
            >
              <div className="text-left">
                <p className="text-[13px] font-semibold">
                  {t("💡 Practice live with Olivia", "💡 与Olivia现场练习")}
                </p>
                <p className="text-[11px] text-white/50">
                  {t("Knowing and saying it confidently are different", "知道答案和自信表达是两回事")}
                </p>
              </div>
              <span className="text-[#F5A800] text-lg ml-3">→</span>
            </button>
          </div>
        )}
      </FunnelPage>

      {/* Bottom sheet modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[80]"
            onClick={dismissModal}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-[90] max-w-[430px] mx-auto bg-dark rounded-t-[24px] p-6 pb-10 animate-slideUp">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            <p className="font-display text-[28px] tracking-wide text-white leading-tight mb-3">
              {t(
                "MOST PEOPLE FREEZE ON QUESTION 2.",
                "大多数人在第2题就卡壳了。"
              )}
            </p>

            <p className="text-[13px] text-white/65 leading-relaxed mb-2">
              {t(
                "Even when they know the answer. Knowing what to say and saying it confidently under pressure are two very different things.",
                "即使他们知道答案。知道该说什么和在压力下自信地说出来是两件完全不同的事。"
              )}
            </p>

            <p className="text-[13px] text-white/65 leading-relaxed mb-6">
              {t(
                "Olivia runs live mock interviews — you get real-time feedback on what NZ panels are actually looking for.",
                "Olivia进行真实模拟面试——你将获得关于新西兰面试官真正想看什么的实时反馈。"
              )}
            </p>

            <Btn onClick={() => router.push("/book")} className="mb-3">
              {t("Practice Live with Olivia — $149", "与Olivia现场练习 — $149")}
            </Btn>

            <button
              onClick={dismissModal}
              className="w-full text-center text-[12px] text-white/40 font-body"
            >
              {t("Keep browsing questions", "继续浏览题目")}
            </button>
          </div>
        </>
      )}
    </Shell>
  );
}
