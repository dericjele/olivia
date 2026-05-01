"use client";

import { ReactNode } from "react";

// ── BUTTONS ──────────────────────────────

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "yellow" | "dark" | "outline" | "ghost";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

export function Btn({
  children,
  onClick,
  variant = "yellow",
  disabled,
  className = "",
  type = "button",
  fullWidth = true,
}: BtnProps) {
  const base =
    "flex items-center justify-center gap-2 rounded-app font-body font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const sizes = "px-6 py-4 text-[15px]";
  const w = fullWidth ? "w-full" : "";

  const variants: Record<string, string> = {
    yellow:  "bg-[#F5A800] text-ink shadow-yellow",
    dark:    "bg-dark text-white",
    outline: "bg-transparent border-2 border-ink text-ink",
    ghost:   "bg-transparent text-mid underline text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes} ${w} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ── SPINNER ───────────────────────────────

export function Spinner({ light = false }: { light?: boolean }) {
  return (
    <div
      className={`w-6 h-6 rounded-full border-[3px] animate-spin2 ${
        light
          ? "border-white/20 border-t-white"
          : "border-ink/20 border-t-ink"
      }`}
    />
  );
}

// ── SCORE CIRCLE ─────────────────────────

export function ScoreCircle({ score, band }: { score: number; band: "low" | "mid" | "high" }) {
  const colors = {
    low:  "bg-red-50 text-danger",
    mid:  "bg-[#FFF8E1] text-[#C98500]",
    high: "bg-sage-pale text-sage",
  };
  return (
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl tracking-wide flex-shrink-0 ${colors[band]}`}
    >
      {score}
    </div>
  );
}

// ── SECTION LABEL ────────────────────────

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#C98500] mb-2">
      {children}
    </p>
  );
}

// ── SCREEN TITLE ─────────────────────────

export function ScreenTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-display text-[38px] tracking-wide text-ink leading-[1] mb-2">
      {children}
    </h1>
  );
}

// ── SCREEN SUB ───────────────────────────

export function ScreenSub({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] text-mid leading-relaxed mb-7">{children}</p>
  );
}

// ── CARD ─────────────────────────────────

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card rounded-app shadow-card p-6 ${className}`}>
      {children}
    </div>
  );
}

// ── DARK CARD ────────────────────────────

export function DarkCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-dark rounded-app p-5 ${className}`}>{children}</div>
  );
}

// ── INSIGHT BAR ──────────────────────────

export function InsightBar({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#FFF8E1] border-l-4 border-[#F5A800] rounded-r-app px-4 py-3 text-[13px] text-ink leading-relaxed mb-4">
      {children}
    </div>
  );
}

// ── PROGRESS BAR ─────────────────────────

export function ProgressBar({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex justify-between text-[11px] text-mid font-medium mb-2">
        <span>{label || `${current} of ${total}`}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 bg-light rounded-full overflow-hidden">
        <div
          className="h-full bg-[#F5A800] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── BACK BUTTON ──────────────────────────

export function BackBtn({
  onClick,
  label = "Back",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-[13px] text-mid font-medium mb-7 hover:text-ink transition-colors"
    >
      ← {label}
    </button>
  );
}

// ── QUIZ OPTION ──────────────────────────

export function QuizOption({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-[10px] border-2 px-4 py-[13px] text-[13px] text-left transition-all font-body ${
        selected
          ? "border-[#F5A800] bg-[#FFF8E1] text-ink"
          : "border-light bg-card text-ink"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] transition-all ${
          selected
            ? "bg-[#F5A800] border-[#F5A800] text-ink"
            : "border-light"
        }`}
      >
        {selected && "✓"}
      </div>
      {children}
    </button>
  );
}

// ── PILL TAG ─────────────────────────────

export function PillTag({
  children,
  color = "yellow",
}: {
  children: ReactNode;
  color?: "yellow" | "sage" | "light";
}) {
  const colors = {
    yellow: "bg-[#FFF8E1] text-[#C98500]",
    sage:   "bg-sage-pale text-sage",
    light:  "bg-light text-mid",
  };
  return (
    <span
      className={`inline-block text-[10px] font-semibold tracking-[0.5px] uppercase px-[10px] py-1 rounded-lg ${colors[color]}`}
    >
      {children}
    </span>
  );
}
