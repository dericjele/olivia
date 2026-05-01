"use client";

import { useRouter } from "next/navigation";
import { Shell, FunnelPage } from "components/Shell";
import { useLang } from "components/LangProvider";
import { BackBtn, Btn, SectionLabel, ScreenTitle } from "components/ui";

const CREDS = [
  { icon: "🎓", en: "ECE Lecturer, Auckland",    zh: "奥克兰幼教讲师" },
  { icon: "📜", en: "TC Registered",             zh: "教师委员会注册" },
  { icon: "🌏", en: "Bilingual EN / 中文",        zh: "双语 中文/英文" },
  { icon: "⭐", en: "3+ Years Consulting",       zh: "3年以上咨询经验" },
];

export default function AboutPage() {
  const router = useRouter();
  const { t } = useLang();

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

        <Btn onClick={() => router.push("/book")}>
          {t("Book a Free Discovery Call", "预约免费探索通话")}
        </Btn>
      </FunnelPage>
    </Shell>
  );
}
