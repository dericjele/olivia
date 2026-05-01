import { createServiceClient } from "@/utils/supabase/server";

export interface LeadInsert {
  contact: string;
  journey?: string;
  score?: number;
  source?: string;
  lang?: string;
  notes?: Record<string, unknown>;
}

/**
 * Insert a new lead into Supabase.
 * Uses service role to bypass RLS — server-side only.
 * Never saves file content — only metadata and contact.
 */
export async function saveLead(data: LeadInsert): Promise<{ id: string } | null> {
  try {
    const supabase = createServiceClient();

    const { data: row, error } = await supabase
      .from("leads")
      .insert({
        contact:  data.contact,
        journey:  data.journey  ?? null,
        score:    data.score    ?? null,
        source:   data.source   ?? null,
        lang:     data.lang     ?? null,
        notes:    data.notes    ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[leads] insert error:", error.message);
      return null;
    }

    return { id: row.id };
  } catch (err) {
    console.error("[leads] unexpected error:", err);
    return null;
  }
}

/**
 * Check if a contact has already submitted — avoid duplicate alerts.
 */
export async function leadExists(contact: string): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const { count } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("contact", contact);
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}
