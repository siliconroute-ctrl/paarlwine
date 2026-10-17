import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { listWines } from "@/lib/wine.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const winesQuery = queryOptions({
  queryKey: ["wines"],
  queryFn: () => listWines(),
});

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Wine Guide — Grapes, Regions and Home Equivalents | Terroir" },
      {
        name: "description",
        content:
          "Search classic wines by name, country or grape and see which bottles sold back home taste closest to them.",
      },
      { property: "og:title", content: "Wine Guide — Grapes, Regions and Home Equivalents" },
      {
        property: "og:description",
        content: "Look up any wine style and find its equivalent in another country.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.paarlwine.com/guide" },
      { property: "og:image", content: "https://app.paarlwine.com/og-guide.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Wine bottles from different countries laid out with grapes and vine leaves" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Wine Guide — Grapes, Regions and Home Equivalents" },
      { name: "twitter:description", content: "Look up any wine style and find its equivalent in another country." },
      { name: "twitter:image", content: "https://app.paarlwine.com/og-guide.jpg" },

    ],
    links: [{ rel: "canonical", href: "https://app.paarlwine.com/guide" }],
  }),

  loader: ({ context }) => context.queryClient.ensureQueryData(winesQuery),
  component: Guide,
});

function Guide() {
  const { data: wines } = useSuspenseQuery(winesQuery);
  const [term, setTerm] = useState("");

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return wines;
    return wines.filter((w) =>
      [w.name, w.country, w.region, w.grape, w.color, w.tasting_notes, ...w.equivalents]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [wines, term]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-4xl md:text-5xl">The guide</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Type a wine, a grape or a country — Sancerre, Nebbiolo, Portugal — and see what it is
          and what drinks like it elsewhere.
        </p>

        <div className="relative mt-6 max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search wines, grapes, countries"
            aria-label="Search the wine guide"
            className="pl-9"
          />
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {results.length} {results.length === 1 ? "wine" : "wines"}
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {results.map((wine) => (
            <article key={wine.id} className="surface-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">
                    {wine.country}
                    {wine.region ? ` · ${wine.region}` : ""}
                  </p>
                  <h2 className="mt-1 text-3xl">{wine.name}</h2>
                </div>
                <Badge variant="secondary">{wine.color}</Badge>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {wine.grape}
                {wine.body ? ` · ${wine.body} body` : ""}
                {wine.sweetness ? ` · ${wine.sweetness}` : ""}
              </p>

              <p className="mt-4 text-sm">{wine.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">{wine.tasting_notes}</p>

              {wine.equivalents.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Similar bottles elsewhere
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {wine.equivalents.map((eq) => (
                      <Badge key={eq} variant="outline">
                        {eq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {wine.food_pairings.length > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Pairs with {wine.food_pairings.join(", ").toLowerCase()}.
                </p>
              )}
            </article>
          ))}
        </div>

        {results.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">
            Nothing matched “{term}”. Try a grape name, or scan the label instead.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>


  );
}
