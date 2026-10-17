import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Camera, Image as ImageIcon, Loader2, RefreshCw, Save, Wine } from "lucide-react";
import { analyzeLabel, saveScan, getProfile, updateProfile } from "@/lib/wine.functions";
import type { LabelAnalysis } from "@/lib/wine.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/lib/countries";
import { fileToCompressedDataUrl } from "@/lib/image";

export const Route = createFileRoute("/_authenticated/scan")({
  head: () => ({
    meta: [
      { title: "Scan a Wine Label — Terroir" },
      {
        name: "description",
        content:
          "Take a photo of any wine label abroad and get the grape, the style and the closest bottle sold back home.",
      },
      { property: "og:title", content: "Scan a Wine Label — Terroir" },
      {
        property: "og:description",
        content: "Photograph a foreign label and compare it to wines in your own country.",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<LabelAnalysis | null>(null);
  const [saved, setSaved] = useState(false);

  const queryClient = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const saveProfile = useServerFn(updateProfile);
  const runAnalyze = useServerFn(analyzeLabel);
  const runSave = useServerFn(saveScan);

  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const homeCountry = profileQuery.data?.home_country ?? "United States";

  const countryMutation = useMutation({
    mutationFn: (country: string) =>
      saveProfile({
        data: { home_country: country, display_name: profileQuery.data?.display_name ?? undefined },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  const analyzeMutation = useMutation({
    mutationFn: async (dataUrl: string) =>
      runAnalyze({ data: { imageDataUrl: dataUrl, homeCountry } }),
    onSuccess: (data) => {
      setResult(data);
      setSaved(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Scan failed."),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!result) throw new Error("Nothing to save");
      let imagePath: string | null = null;
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (imageFile && uid) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("wine-labels").upload(path, imageFile);
        if (!error) imagePath = path;
      }
      return runSave({ data: { analysis: result, homeCountry, imagePath } });
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      toast.success("Saved to your cellar.");
    },
    onError: () => toast.error("Could not save that scan."),
  });

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setImageFile(file);
    setResult(null);
    setSaved(false);
    try {
      const url = await fileToCompressedDataUrl(file);
      setImageDataUrl(url);
      analyzeMutation.mutate(url);
    } catch {
      toast.error("Could not read that photo — try another one.");
    }
  }

  function reset() {
    setImageDataUrl(null);
    setImageFile(null);
    setResult(null);
    setSaved(false);
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-4xl md:text-5xl">Scan a label</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Point your camera at the front label. Terroir reads it and compares it to wines sold in
          your home country.
        </p>

        <div className="mt-6 max-w-xs space-y-2">
          <Label htmlFor="home-country">Comparing against</Label>
          <Select value={homeCountry} onValueChange={(value) => countryMutation.mutate(value)}>
            <SelectTrigger id="home-country">
              <SelectValue placeholder="Home country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <div className="surface-card mt-8 p-6">
          {imageDataUrl ? (
            <div className="space-y-4">
              <img
                src={imageDataUrl}
                alt="The wine label you photographed"
                className="mx-auto max-h-80 rounded-lg border border-border object-contain"
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="cellar" onClick={reset}>
                  <RefreshCw className="h-4 w-4" />
                  New photo
                </Button>
                {!analyzeMutation.isPending && !result && (
                  <Button variant="gold" onClick={() => analyzeMutation.mutate(imageDataUrl)}>
                    Try again
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-gold/40 px-6 py-12 text-center">
              <Camera className="h-8 w-8 text-gold" aria-hidden />
              <span className="text-display text-2xl">Add the wine label</span>
              <span className="text-sm text-muted-foreground">
                Photos are resized automatically — any size works.
              </span>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button variant="gold" onClick={() => cameraRef.current?.click()}>
                  <Camera className="h-4 w-4" />
                  Take a photo
                </Button>
                <Button variant="cellar" onClick={() => galleryRef.current?.click()}>
                  <ImageIcon className="h-4 w-4" />
                  Choose from gallery
                </Button>
              </div>
            </div>
          )}
        </div>

        {analyzeMutation.isPending && (
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            Reading the label and looking for matches at home…
          </div>
        )}

        {result && (
          <section className="surface-card mt-6 p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                {result.country && (
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">
                    {result.country}
                    {result.region ? ` · ${result.region}` : ""}
                  </p>
                )}
                <h2 className="mt-1 text-3xl">{result.wine_name}</h2>
                {result.producer && (
                  <p className="text-sm text-muted-foreground">{result.producer}</p>
                )}
              </div>
              <Badge variant={result.confidence === "high" ? "secondary" : "outline"}>
                {result.confidence} confidence
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {result.grape && <Badge variant="outline">{result.grape}</Badge>}
              {result.color && <Badge variant="outline">{result.color}</Badge>}
              {result.style && <Badge variant="outline">{result.style}</Badge>}
            </div>

            {result.summary && <p className="mt-5 text-sm leading-relaxed">{result.summary}</p>}

            <div className="mt-6 border-t border-border pt-5">
              <h3 className="text-2xl">Back home in {homeCountry}</h3>
              {result.equivalents.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No confident match — try a sharper photo of the front label.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {result.equivalents.map((eq) => (
                    <li key={eq.name} className="rounded-lg bg-secondary/60 p-4">
                      <p className="flex items-center gap-2 text-base">
                        <Wine className="h-4 w-4 text-gold" aria-hidden />
                        <span className="font-medium">{eq.name}</span>
                        <span className="text-xs text-muted-foreground">{eq.country}</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{eq.why}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {result.paarl_pick && (
              <div className="mt-5 rounded-lg border border-gold/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">From Paarl</p>
                <p className="mt-1 text-base font-medium">
                  {result.paarl_pick.estate} — {result.paarl_pick.style}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{result.paarl_pick.why}</p>
                <Link
                  to="/estates"
                  className="mt-2 inline-block text-sm text-gold underline-offset-4 hover:underline"
                >
                  See Paarl estates
                </Link>
              </div>
            )}

            {result.food_pairings.length > 0 && (
              <p className="mt-5 text-sm text-muted-foreground">
                Pairs with {result.food_pairings.join(", ").toLowerCase()}.
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                variant="gold"
                disabled={saved || saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saved ? "Saved" : "Save to my cellar"}
              </Button>
              <Button asChild variant="cellar">
                <Link to="/cellar">View cellar</Link>
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
