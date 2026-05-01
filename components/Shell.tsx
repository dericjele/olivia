"use client";

import { useState, ReactNode } from "react";
import { Drawer, HamburgerBtn } from "./Drawer";

export function Shell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <HamburgerBtn open={drawerOpen} onClick={() => setDrawerOpen(!drawerOpen)} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="min-h-svh bg-off">{children}</main>
    </>
  );
}

// FunnelPage — standard wrapper for all funnel screens
export function FunnelPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-5 pt-[72px] pb-28 min-h-svh bg-off ${className}`}>
      {children}
    </div>
  );
}
