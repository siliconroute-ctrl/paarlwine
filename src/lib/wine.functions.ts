import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { ESTATES } from "@/lib/estates";

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
  paarl_pick?: { estate: string; style: string; why: string } | null;
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
    return data ?? { id: context.userId, display_name: null, home_country: "United States" };
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

function buildSystemPrompt(): string {
  const estates = ESTATES.map((e) => `- ${e.name} (${e.town}): ${e.grapes.join(", ")}`).join("\n");
  return `You are a Master of Wine helping a traveller understand a foreign wine label.
Read the label and identify the wine. Then explain, in plain language, what it is and which
wines sold in the traveller's home country taste closest to it.
Be concrete about grape variety, because many European labels name a place instead of a grape.
Never invent a producer, vintage or detail you cannot read on the label; leave a field empty instead.

Also suggest ONE Paarl (Western Cape, South Africa) estate whose wine drinks in a similar way.
You may ONLY choose from this list of real estates, and only when the match is genuine:
${estates}
If none of them is a genuine match, set "paarl_pick" to null.

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
  "food_pairings": [string],
  "paarl_pick": { "estate": string, "style": string, "why": string } | null
}
Give 2-3 equivalents, all commonly available in the traveller's home country.
If the image is not a wine label, set confidence to "low" and wine_name to "Not a wine label".`;
}

const IMAGE_DATA_URL = /^data:(image\/(?:jpeg|png|gif|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_IMAGE_CHARS = 7_000_000;

export const analyzeLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { imageDataUrl: string; homeCountry: string }) => {
    if (!input.imageDataUrl || !IMAGE_DATA_URL.test(input.imageDataUrl)) {
      throw new Error("A photo of the wine label is required.");
    }
    if (input.imageDataUrl.length > MAX_IMAGE_CHARS) {
      throw new Error("That photo is too large. Try a smaller one.");
    }
    return {
      imageDataUrl: input.imageDataUrl,
      homeCountry: String(input.homeCountry || "United States").slice(0, 80),
    };
  })
  .handler(async ({ data, context }): Promise<LabelAnalysis> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Label scanning is not configured yet.");

    // Cost guard: a per-user rolling 24h cap on AI scans.
    const dailyLimit = Number(process.env.SCAN_DAILY_LIMIT ?? 20);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await context.supabase
      .from("scan_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);
    if ((count ?? 0) >= dailyLimit) {
      throw new Error(
        `You have reached today's limit of ${dailyLimit} scans. Please come back tomorrow.`,
      );
    }

    const match = IMAGE_DATA_URL.exec(data.imageDataUrl)!;
    const [, mediaType, base64] = match;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 1500,
        system: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              {
                type: "text",
                text: `The traveller's home country is ${data.homeCountry}. Identify this wine label and give home-country equivalents.`,
              },
            ],
          },
        ],
      }),
    });

    if (res.status === 429 || res.status === 529) {
      throw new Error("Too many scans right now — try again in a moment.");
    }
    if (res.status === 401 || res.status === 403) {
      console.error("Anthropic auth error", res.status);
      throw new Error("Label scanning is not configured correctly yet.");
    }
    if (!res.ok) {
      console.error("Anthropic API error", res.status, await res.text());
      throw new Error("Could not read that label. Try a clearer photo.");
    }

    // Count the scan only once the AI call has succeeded.
    await context.supabase.from("scan_log").insert({ user_id: context.userId });

    const payload = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const raw = payload.content?.find((b) => b.type === "text")?.text ?? "";
    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first === -1 || last === -1) throw new Error("Could not read that label. Try again.");

    let parsed: Partial<LabelAnalysis>;
    try {
      parsed = JSON.parse(cleaned.slice(first, last + 1)) as Partial<LabelAnalysis>;
    } catch {
      throw new Error("Could not read that label. Try again.");
    }

    const pick = parsed.paarl_pick;
    const knownEstate = pick && ESTATES.some((e) => e.name === pick.estate);
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
      paarl_pick: knownEstate ? pick : null,
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
