"use client";

import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "@/components/Shell";
import { useLang } from "@/components/LangProvider";
import { BackBtn, Btn, SectionLabel, ScreenTitle, Card } from "@/components/ui";

const CREDS = [
  { icon: "🎓", en: "ECE Lecturer, Auckland",  zh: "奥克兰幼教讲师" },
  { icon: "📜", en: "TC Registered",            zh: "教师委员会注册" },
  { icon: "🌏", en: "Bilingual EN / 中文",       zh: "双语 中文/英文" },
  { icon: "⭐", en: "3+ Years Consulting",      zh: "3年以上咨询经验" },
];

const SERVICES = [
  { price: "$97",  en: "Async CV Review",      zh: "异步简历审阅",   desc_en: "Written audit + action plan. No scheduling. 48hr turnaround.", desc_zh: "书面审阅+行动计划，无需预约，48小时交付。" },
  { price: "$167", en: "Clarity Session",       zh: "单次咨询",       desc_en: "60-min 1:1. You pick the topic.", desc_zh: "60分钟一对一，自选主题。", hot: true },
  { price: "$597", en: "The Full Pathway",      zh: "全套方案",       desc_en: "CV + interviews + registration + 30-day support.", desc_zh: "简历+面试+注册+30天支持。" },
];

export default function AboutPage() {
  const router = useRouter();
  const { t }  = useLang();

  return (
    <Shell>
      <FunnelPage>
        <BackBtn onClick={() => router.push("/")} label={t("Back", "返回")} />
        <SectionLabel>{t("About", "关于我")}</SectionLabel>
        <ScreenTitle>{t("MEET\nOLIVIA.", "认识\nOLIVIA")}</ScreenTitle>

        {/* Photo */}
        <div className="relative rounded-app overflow-hidden mb-5 h-[260px]">
          <img src="/olivia.png" alt="Olivia" className="w-full h-full object-cover object-top" />
          <div className="absolute bottom-0 left-0 right-0 bg-dark/85 backdrop-blur-sm p-4">
            <p className="font-body italic text-[13px] text-white/85 leading-relaxed">
              {t(
                '"I\'ve seen what happens when talented ECE professionals don\'t get the right guidance. I\'m here to change that."',
                '"我见过太多有才华的幼教专业人士因缺乏正确指导而错失机会。我在这里，就是为了改变这一切。"'
              )}
            </p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-[13px] text-mid leading-relaxed mb-5">
          {t(
            "I'm an ECE lecturer based in Auckland with over three years of experience guiding Chinese-trained professionals into New Zealand's early childhood sector. I know this industry from both sides — as an educator training the next generation, and as someone who has watched hundreds of qualified people struggle simply because nobody explained the system to them.",
            "我是一名奥克兰的幼教讲师，拥有超过三年指导华人培训专业人士进入新西兰幼教行业的经验。我从两个角度了解这个行业——作为培训下一代的教育者，以及见证无数合格人才仅因无人解释体系而举步维艰的见证者。"
          )}
        </p>

        {/* Credentials */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CREDS.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-card border border-light rounded-pill px-[13px] py-[7px] shadow-card text-[12px] text-ink font-medium">
              {c.icon} {t(c.en, c.zh)}
            </div>
          ))}
        </div>

        {/* Services */}
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-mid mb-3">
          {t("Services", "服务")}
        </p>
        <div className="flex flex-col gap-3 mb-6">
          {SERVICES.map((s, i) => (
            <div key={i} className={`rounded-app p-4 border-2 ${s.hot ? "bg-dark border-[#F5A800]" : "bg-card border-light"}`}>
              <div className="flex items-center justify-between mb-1">
                <p className={`text-[14px] font-semibold ${s.hot ? "text-white" : "text-ink"}`}>{t(s.en, s.zh)}</p>
                <p className={`text-[18px] font-bold ${s.hot ? "text-[#F5A800]" : "text-[#C98500]"}`}>{s.price}</p>
              </div>
              <p className={`text-[12px] ${s.hot ? "text-white/60" : "text-mid"}`}>{t(s.desc_en, s.desc_zh)}</p>
            </div>
          ))}
        </div>

        <Btn onClick={() => router.push("/book")}>
          {t("Book a Free Discovery Call", "预约免费探索通话")}
        </Btn>
      </FunnelPage>
    </Shell>
  );
}
