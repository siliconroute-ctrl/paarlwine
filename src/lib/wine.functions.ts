import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type WineRow = Database["public"]["Tables"]["wines"]["Row"];
export type ScanRow = Database["public"]["Tables"]["scans"]["Row"];

export interface Equivalent {
  name: string;
  country: string;
  why: string;
}

export interface LabelAnalysis {
  wine_name: string;
  producer: string;
  country: string;
  region: string;
  grape: string;
  color: string;
  style: string;
  summary: string;
  label_text: string;
  confidence: "high" | "medium" | "low";
  equivalents: Equivalent[];
  food_pairings: string[];
}

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listWines = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("wines")
    .select(
      "id, name, country, region, grape, color, body, sweetness, tasting_notes, food_pairings, equivalents, description",
    )
    .order("country")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("scans")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("scans")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("id, display_name, home_country")
      .eq("id", context.userId)
      .maybeSingle();
    return (
      data ?? { id: context.userId, display_name: null, home_country: "United States" }
    );
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { display_name?: string; home_country: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert(
      {
        id: context.userId,
        display_name: data.display_name ?? null,
        home_country: data.home_country,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const SYSTEM_PROMPT = `You are a Master of Wine helping a traveller understand a foreign wine label.
Read the label and identify the wine. Then explain, in plain language, what it is and which
wines sold in the traveller's home country taste closest to it.
Be concrete about grape variety, because many European labels name a place instead of a grape.
Respond with ONLY a JSON object, no markdown fences, matching exactly:
{
  "wine_name": string,
  "producer": string,
  "country": string,
  "region": string,
  "grape": string,
  "color": "Red" | "White" | "Rose" | "Sparkling" | "Fortified" | "Unknown",
  "style": string,
  "summary": string,
  "label_text": string,
  "confidence": "high" | "medium" | "low",
  "equivalents": [{ "name": string, "country": string, "why": string }],
  "food_pairings": [string]
}
Give 2-3 equivalents, all commonly available in the traveller's home country.
If the image is not a wine label, set confidence to "low" and wine_name to "Not a wine label".`;

export const analyzeLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { imageDataUrl: string; homeCountry: string }) => {
    if (!input.imageDataUrl?.startsWith("data:image/")) {
      throw new Error("A photo of the wine label is required.");
    }
    return input;
  })
  .handler(async ({ data }): Promise<LabelAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured for this app yet.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The traveller's home country is ${data.homeCountry}. Identify this wine label and give home-country equivalents.`,
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Too many scans right now — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      throw new Error("Could not read that label. Try a clearer photo.");
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("Could not read that label. Try again.");

    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<LabelAnalysis>;
    return {
      wine_name: parsed.wine_name || "Unknown wine",
      producer: parsed.producer || "",
      country: parsed.country || "",
      region: parsed.region || "",
      grape: parsed.grape || "",
      color: parsed.color || "Unknown",
      style: parsed.style || "",
      summary: parsed.summary || "",
      label_text: parsed.label_text || "",
      confidence: parsed.confidence || "low",
      equivalents: Array.isArray(parsed.equivalents) ? parsed.equivalents.slice(0, 3) : [],
      food_pairings: Array.isArray(parsed.food_pairings) ? parsed.food_pairings : [],
    };
  });

export const saveScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { analysis: LabelAnalysis; homeCountry: string; imagePath?: string | null }) => input,
  )
  .handler(async ({ data, context }) => {
    const a = data.analysis;
    const top = a.equivalents[0];
    const { data: row, error } = await context.supabase
      .from("scans")
      .insert({
        user_id: context.userId,
        label_text: a.label_text,
        wine_name: a.wine_name,
        producer: a.producer,
        country: a.country,
        region: a.region,
        grape: a.grape,
        color: a.color,
        summary: a.summary,
        equivalent_name: top?.name ?? null,
        equivalent_country: top?.country ?? null,
        equivalent_note: top?.why ?? null,
        home_country: data.homeCountry,
        image_path: data.imagePath ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });
