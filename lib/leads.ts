import { createServiceClient } from "@/utils/supabase/server";

export interface LeadInsert {
  contact:           string;
  journey?:          string;
  score?:            number;
  source?:           string;
  lang?:             string;
  city?:             string;
  nz_duration?:      string;
  employed?:         string;
  heard_from?:       string;
  booking_need?:     string;
  booking_timeline?: string;
  notes?:            Record<string, unknown>;
}

export async function saveLead(data: LeadInsert): Promise<{ id: string } | null> {
  try {
    const supabase = createServiceClient();
    const { data: row, error } = await supabase
      .from("leads")
      .insert({
        contact:           data.contact,
        journey:           data.journey           ?? null,
        score:             data.score             ?? null,
        source:            data.source            ?? null,
        lang:              data.lang              ?? null,
        city:              data.city              ?? null,
        nz_duration:       data.nz_duration       ?? null,
        employed:          data.employed          ?? null,
        heard_from:        data.heard_from        ?? null,
        booking_need:      data.booking_need      ?? null,
        booking_timeline:  data.booking_timeline  ?? null,
        notes:             data.notes             ?? null,
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
