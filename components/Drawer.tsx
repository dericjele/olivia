"use client";

import { useEffect } from "react";
import { useLang } from "./LangProvider";
import { useRouter, usePathname } from "next/navigation";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { icon: "🏠", en: "Home",              zh: "首页",         href: "/" },
  { icon: "🧭", en: "Start My Journey",  zh: "开始我的旅程", href: "/journey" },
  { icon: "✅", en: "Readiness Quiz",    zh: "准备度测试",   href: "/quiz" },
  { icon: "📄", en: "CV Analyser",       zh: "简历分析",     href: "/cv" },
  { icon: "🗺️", en: "Registration Path", zh: "注册路径",     href: "/pathway" },
  { icon: "🎤", en: "Interview Bank",    zh: "面试题库",     href: "/interview" },
  { icon: "🤝", en: "Workplace Support", zh: "职场支持",     href: "/workplace" },
  { icon: "📅", en: "Book a Session",    zh: "预约咨询",     href: "/book" },
  { icon: "👩", en: "About Olivia",      zh: "关于Olivia",   href: "/about" },
];

export function Drawer({ open, onClose }: DrawerProps) {
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const pathname = usePathname();

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[150] transition-all duration-300 ${
          open ? "bg-black/45 pointer-events-auto" : "bg-black/0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-[160] w-[260px] bg-dark flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-14 pb-6 bg-ink border-b border-white/5">
          <div className="font-display text-[28px] tracking-[2px] text-[#F5A800]">
            OLIVIA
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            {t("NZ ECE Career Guidance", "新西兰幼教职业指导")}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-[14px] px-6 py-[14px] text-[14px] font-medium font-body transition-all border-l-[3px] text-left ${
                  isActive
                    ? "border-[#F5A800] text-[#F5A800] bg-[#F5A800]/6"
                    : "border-transparent text-white/65 hover:text-[#F5A800] hover:border-[#F5A800] hover:bg-[#F5A800]/4"
                }`}
              >
                <span className="text-[18px] w-6 text-center">{item.icon}</span>
                {t(item.en, item.zh)}
              </button>
            );
          })}
        </nav>

        {/* Language toggle */}
        <div className="px-6 py-5 border-t border-white/5">
          <div className="flex gap-2">
            {(["en", "zh"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 py-2 rounded-[10px] border text-[13px] font-semibold font-body transition-all ${
                  lang === l
                    ? "bg-[#F5A800] border-[#F5A800] text-ink"
                    : "bg-transparent border-white/12 text-white/50"
                }`}
              >
                {l === "en" ? "EN" : "中文"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── HAMBURGER BUTTON ──────────────────────

export function HamburgerBtn({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Menu"
      className="fixed top-4 left-4 z-[200] w-11 h-11 rounded-full bg-dark flex flex-col items-center justify-center gap-[5px] shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-colors"
    >
      <span
        className={`block w-[18px] h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${
          open ? "translate-y-[7px] rotate-45" : ""
        }`}
      />
      <span
        className={`block w-[18px] h-[2px] bg-white rounded-full transition-all duration-300 ${
          open ? "opacity-0 scale-x-0" : ""
        }`}
      />
      <span
        className={`block w-[18px] h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${
          open ? "-translate-y-[7px] -rotate-45" : ""
        }`}
      />
    </button>
  );
}
