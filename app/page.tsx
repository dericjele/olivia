"use client";

import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { useLang } from "@/components/LangProvider";
import { useEffect, useState } from "react";
import { getTrafficSource, getLead } from "@/lib/storage";

export default function Home() {
  const router   = useRouter();
  const { lang } = useLang();
  const [returning, setReturning] = useState<{ score?: number; journey?: string } | null>(null);

  useEffect(() => {
    getTrafficSource();
    const lead = getLead();
    if (lead.contact && (lead.quizScore || lead.cvScore)) {
      setReturning({ score: lead.quizScore ?? lead.cvScore, journey: lead.journeyType ?? undefined });
    }
  }, []);

  return (
    <Shell>
      <div className="relative h-svh min-h-[580px] overflow-hidden bg-dark">
        <div className="absolute top-[-60px] right-[-60px] w-[180px] h-[180px] bg-[#F5A800] opacity-90 animate-blob z-10 rounded-full" />
        <img src="/olivia.png" alt="Olivia"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent via-50% to-black/97" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-9 animate-fadeUp">

          {returning ? (
            <div className="bg-[#F5A800]/12 border border-[#F5A800]/25 rounded-app p-4 mb-5">
              <p className="text-[13px] text-white/90 font-medium mb-1">
                {lang === "zh" ? "👋 欢迎回来" : "👋 Welcome back"}
              </p>
              <p className="text-[12px] text-white/55 leading-relaxed">
                {lang === "zh"
                  ? `你的进度已保存${returning.score ? `——上次得分 ${returning.score}%` : ""}。准备好迈出下一步了吗？`
                  : `Your progress is saved${returning.score ? ` — you scored ${returning.score}% last time` : ""}. Ready for the next step?`}
              </p>
              <button onClick={() => router.push("/book")}
                className="mt-2 text-[12px] font-semibold text-[#F5A800]">
                {lang === "zh" ? "预约与Olivia的通话 →" : "Book a call with Olivia →"}
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-[#F5A800] text-ink text-[11px] font-semibold tracking-[1.5px] uppercase px-3 py-[5px] rounded-full mb-4">
              <div className="w-[6px] h-[6px] rounded-full bg-ink animate-pulse2" />
              {lang === "zh" ? "奥克兰，新西兰" : "Auckland, New Zealand"}
            </div>
          )}

          <h1 className="font-display text-[48px] text-white leading-[0.95] tracking-[2px] mb-3">
            {lang === "zh" ? (
              <>你已经够格了。<br /><span className="text-[#F5A800]">让新西兰看见你。</span></>
            ) : (
              <>YOU&apos;RE ALREADY<br />QUALIFIED.<br /><span className="text-[#F5A800]">LET&apos;S MAKE SURE<br />NZ KNOWS IT.</span></>
            )}
          </h1>

          <p className="text-[14px] text-white/65 leading-relaxed mb-5 max-w-[300px]">
            {lang === "zh"
              ? "许多华人幼教专业人士在新西兰被低估。不是因为能力不足，而是没有人告诉他们规则是什么。"
              : "Most qualified Chinese ECE teachers in NZ are underemployed. Not because they're not good enough. Because nobody explained how the system works."}
          </p>

          {/* Trust bar — quiet, not loud */}
          <div className="flex items-center gap-3 mb-5">
            <img src="/olivia.png" alt="Olivia"
              className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0 border border-white/20" />
            <p className="text-[12px] text-white/55 leading-snug">
              <span className="text-white/80 font-medium">Olivia</span>
              {lang === "zh"
                ? " · 奥克兰幼教讲师 · 双语"
                : " · ECE Lecturer, Auckland · Bilingual"}
            </p>
          </div>

          <button onClick={() => router.push("/journey")}
            className="w-full flex items-center justify-between bg-[#F5A800] rounded-[18px] px-6 py-[18px] shadow-[0_6px_24px_rgba(245,168,0,0.28)] active:scale-[0.98] transition-all">
            <span className="text-[15px] font-semibold text-[#111] font-body">
              {lang === "zh" ? "我从哪里开始？→" : "Where do I start? →"}
            </span>
            <div className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center text-[#F5A800] text-lg">→</div>
          </button>
        </div>
      </div>
    </Shell>
  );
}
