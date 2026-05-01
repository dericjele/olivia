"use client";

import type { LeadData } from "./types";

const KEY = "olivia_lead";

export function saveLead(updates: Partial<LeadData>): void {
  try {
    const existing = getLead();
    const updated: LeadData = {
      ...existing,
      ...updates,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch (_) {}
}

export function getLead(): LeadData {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch (_) {
    return {};
  }
}

export function saveContact(contact: string, source: string): void {
  saveLead({ contact, [`contact_${source}`]: contact } as LeadData & Record<string, string>);
}

export function getTrafficSource(): string | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const src = p.get("src");
  if (src) saveLead({ trafficSource: src });
  return src;
}
